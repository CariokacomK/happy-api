import { AcaoProcesso, OrigemEvento } from "../models/DW/dwModels";
import { TipoAmbienteEmissao } from "../models/enum/TipoAmbienteEmissao";
import { TipoId } from "../models/enum/TipoId";
import { TipoNota } from "../models/enum/TipoNota";
import { NotaFiscalProduto } from "../models/nfe/NotaFiscalProduto";
import { NotaFiscalServico } from "../models/nfes/NotaFiscalServico";
import { Servico } from "../models/nfes/Servico";
import { iniciarAcao, registrarFalhaLocalDW, registrarRetornoApi, processoJaConcluido } from "../repositories/EnotasDw.prisma";
import { InutilizarNotaFiscalDTO } from "../schemas/body/InutilizarNotaFiscal.schema";
import { NotaFiscalDTO } from "../schemas/body/NotaFiscal.schema";
import { resolveAncoraCancelamento, resolveAncoraInutilizacao } from "../utils/DwUtils";
import utils from "../utils/Utils";
import configNotasService from "./ConfigNotasService";
import eNotasService from "./eNotasService";

class NotaFiscalService {
  async buscarNota(empresaId: string, notaId: string, tipoId: TipoId) {
    return (tipoId === TipoId.INTERNO)
      ? eNotasService.buscarNfeIdInterno(empresaId, notaId)
      : eNotasService.buscarNfeIdEnotas(empresaId, notaId);
  }

  async cancelarNota(empresaId: string, notaId: string, tipoId: TipoId) {
    const ancora = await resolveAncoraCancelamento(notaId, tipoId);

    if (await processoJaConcluido({ ancora, acao: AcaoProcesso.CANCELAMENTO })) return;

    try {
      await iniciarAcao({ acao: AcaoProcesso.CANCELAMENTO, ancora });
    } catch (e: any) {
      await registrarFalhaLocalDW({
        ancora,
        mensagem: e?.message ?? "Falha ao iniciar cancelamento",
        acao: AcaoProcesso.CANCELAMENTO,
      });
    }

    try {
      const resp = (tipoId === TipoId.INTERNO)
        ? await eNotasService.cancelarNfeIdInterno(empresaId, notaId)
        : await eNotasService.cancelarNfeIdEnotas(empresaId, notaId);

      await registrarRetornoApi({
        acao: AcaoProcesso.CANCELAMENTO,
        ancora,
        httpStatus: 200,
        payload: resp,
      });
      return resp;
    } catch (err: any) {
      const http = utils.httpFromErr(err);

      await registrarRetornoApi({
        acao: AcaoProcesso.CANCELAMENTO,
        ancora,
        httpStatus: http || 0,
        codigoErro: err?.details?.codigo ?? null,
        mensagemErro: err?.details?.mensagem ?? (err?.message ?? "Erro"),
        payload: err?.details ?? null,
      });

      if (!http || http < 100) {
        await registrarFalhaLocalDW({
          ancora,
          mensagem: err?.message ?? "Falha local ao cancelar NFe",
          codigo: err?.details?.codigo ?? null,
          acao: AcaoProcesso.CANCELAMENTO,
        });
      }
      throw err;
    }
  }

  async emitirNota(dto: NotaFiscalDTO) {
    const idRequisicao = (dto.tipoEmissao === "PRODUTO" ? "NFe" : "NFeS") + `${dto.idCobranca}`;

    if (await processoJaConcluido({ correlationId: idRequisicao, acao: AcaoProcesso.EMISSAO })) return;


    const empresa = await configNotasService.encontrarEmpresa(dto.idEnotas);

    await iniciarAcao({
      acao: AcaoProcesso.EMISSAO,
      idRequisicao,
      idCobranca: dto.idCobranca,
      valorTotal: dto.valorTotal,
      emitente: {
        cnpj: empresa.cnpj,
        razao_social: empresa.razaoSocial,
        ie: empresa.inscricaoEstadual ?? null,
        uf: empresa.endereco?.uf,
        municipio: empresa.endereco?.cidade,
      },
      dest: {
        id_doc: dto.cliente.cpfCnpj,
        nome_razao: dto.cliente.nome,
        uf: dto.cliente.endereco?.uf ?? null,
        municipio: dto.cliente.endereco?.cidade ?? null,
        cep: dto.cliente.endereco?.cep ?? null,
      },
    });

    return this.montarCorpoNota(dto, idRequisicao);
  }

  async inutilizarNota(dto: InutilizarNotaFiscalDTO) {
    const ancora = resolveAncoraInutilizacao(dto);

    if (await processoJaConcluido({ ancora, acao: AcaoProcesso.INUTILIZACAO })) return;

    if (ancora) {
      try {
        await iniciarAcao({
          acao: AcaoProcesso.INUTILIZACAO,
          origem: OrigemEvento.API,
          ancora,
        });
      } catch (e: any) {
        await registrarFalhaLocalDW({
          ancora,
          mensagem: e?.message ?? "Falha ao iniciar inutilização",
          acao: AcaoProcesso.INUTILIZACAO,
        });
      }
    }

    try {
      const resp = await eNotasService.inutilizarNfe(dto);

      if (ancora) {
        await registrarRetornoApi({
          acao: AcaoProcesso.INUTILIZACAO,
          ancora,
          httpStatus: 200,
          payload: resp,
        });
      }

      return resp;
    } catch (err: any) {
      const http = utils.httpFromErr(err);

      if (ancora) {
        await registrarRetornoApi({
          acao: AcaoProcesso.INUTILIZACAO,
          ancora,
          httpStatus: http,
          codigoErro: err?.details?.codigo ?? null,
          mensagemErro: err?.details?.mensagem ?? (err?.message ?? "Erro"),
          payload: err?.details ?? null,
        });

        if (http < 100) {
          await registrarFalhaLocalDW({
            ancora,
            mensagem: err?.message ?? "Falha local ao inutilizar numeração",
            codigo: err?.details?.codigo ?? null,
            acao: AcaoProcesso.INUTILIZACAO,
          });
        }
      }

      throw err;
    }
  }


  private async montarCorpoNota(dto: NotaFiscalDTO, idRequisicao: string) {
    const cliente = dto.cliente;
    const servico: Servico = { descricao: "Pagamento de parcela do curso da Happy" };
    const valor = dto.valorTotal;
    const idEnotas = dto.idEnotas;
    const idCobranca = dto.idCobranca;
    const ambienteEmissao = dto.ambienteEmissao;
    const tipoPagamento = dto.tipoPagamento;

    if (dto.tipoEmissao === TipoNota.SERVICO) {
      const notaFiscalSerivce: NotaFiscalServico = {
        cliente,
        idExterno: idRequisicao,
        servico,
        valorTotal: valor,
        ambienteEmissao,
      };

      try {
        const resp = await eNotasService.emitirNFes(idEnotas, notaFiscalSerivce);

        await registrarRetornoApi({
          acao: AcaoProcesso.EMISSAO,
          ancora: { idRequisicao },
          httpStatus: 200,
          payload: { ...resp, ambienteEmissao, formaPagamento: null },
          ambiente: ambienteEmissao as TipoAmbienteEmissao,
        });

        return resp;
      } catch (err: any) {
        const http = utils.httpFromErr(err);

        await registrarRetornoApi({
          acao: AcaoProcesso.EMISSAO,
          ancora: { idRequisicao },
          httpStatus: http || 0,
          codigoErro: err?.details?.codigo ?? null,
          mensagemErro: err?.details?.mensagem ?? (err?.message ?? "Erro"),
          payload: err?.details ?? null,
          ambiente: ambienteEmissao as TipoAmbienteEmissao,
        });

        if (!http || http < 100) {
          await registrarFalhaLocalDW({
            ancora: { idRequisicao },
            mensagem: err?.message ?? "Falha local ao emitir NFe de serviço",
            codigo: err?.details?.codigo ?? null,
            acao: AcaoProcesso.EMISSAO,
          });
        }
        throw err;
      }
    }

    const notaFiscalProduto: NotaFiscalProduto = {
      id: idRequisicao,
      enviadaPorEmail: false,
      tipoOperacao: "Saida",
      finalidade: "Normal",
      cliente,
      pedido: await configNotasService.montarPedido(tipoPagamento, valor),
      itens: [await configNotasService.montarItem(cliente, idCobranca, valor)],
      ambienteEmissao,
      consumidorFinal: true,
    };

    try {
      const resp = await eNotasService.emitirNfe(notaFiscalProduto);
      const formaPagamento = configNotasService.tipoPagamentoDesc(tipoPagamento);
      const parsedResp = typeof resp === "string" ? JSON.parse(resp) : resp;

      await registrarRetornoApi({
        acao: AcaoProcesso.EMISSAO,
        ancora: { idRequisicao },
        httpStatus: 200,
        payload: { ...parsedResp, ambienteEmissao, formaPagamento },
        ambiente: ambienteEmissao as TipoAmbienteEmissao,
        formaPagamento,
      });

      return resp;
    } catch (err: any) {
      const http = utils.httpFromErr(err);

      await registrarRetornoApi({
        acao: AcaoProcesso.EMISSAO,
        ancora: { idRequisicao },
        httpStatus: http || 0,
        codigoErro: err?.details?.codigo ?? null,
        mensagemErro: err?.details?.mensagem ?? (err?.message ?? "Erro"),
        payload: err?.details ?? null,
        ambiente: ambienteEmissao as TipoAmbienteEmissao,
      });

      if (!http || http < 100) {
        await registrarFalhaLocalDW({
          ancora: { idRequisicao },
          mensagem: err?.message ?? "Falha local ao emitir NFe de produto",
          codigo: err?.details?.codigo ?? null,
          acao: AcaoProcesso.EMISSAO,
        });
      }
      throw err;
    }
  }
}

export default new NotaFiscalService();