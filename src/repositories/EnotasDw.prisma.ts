import { prisma } from '../infra/prisma';
import { AcaoProcesso, Ancora, DestinatarioInput, IniciarAcaoInput, OrigemEvento, ProcessarWebhookNfeInput, RegistrarRetornoApiInput, TipoEvento } from '../models/DW/dwModels';
import { TipoAmbienteEmissao } from '../models/enum/TipoAmbienteEmissao';
import utils from '../utils/Utils';

type Tx = Parameters<typeof prisma.$transaction>[0] extends (arg: infer A)=>any ? A : any;

async function idStatusProcesso(tx: Tx, codigo: string) {
  const r = await tx.dim_status_processo.findFirst({ where: { codigo }, select: { id_status_processo: true }});
  if (!r) throw new Error(`DIM_STATUS_PROCESSO sem código ${codigo}`);
  return r.id_status_processo;
}
async function idOrigemEvento(tx: Tx, codigo: OrigemEvento) {
  const r = await tx.dim_origem_evento.findFirst({ where: { codigo }, select: { id_origem_evento: true }});
  if (!r) throw new Error(`DIM_ORIGEM_EVENTO sem código ${codigo}`);
  return r.id_origem_evento;
}
async function idTipoEvento(tx: Tx, codigo: string) {
  const r = await tx.dim_tipo_evento.findFirst({ where: { codigo }, select: { id_tipo_evento: true }});
  if (!r) throw new Error(`DIM_TIPO_EVENTO sem código ${codigo}`);
  return r.id_tipo_evento;
}
async function idAcaoProc(tx: Tx, codigo: AcaoProcesso) {
  const r = await tx.dim_acao_processo.findFirst({ where: { codigo }, select: { id_acao_processo: true }});
  if (!r) throw new Error(`DIM_ACAO_PROCESSO sem código ${codigo}`);
  return r.id_acao_processo;
}

async function resolveIdProcesso(tx: Tx, ancora?: Ancora): Promise<bigint | null> {
  if (!ancora) return null;
  if (ancora.idProcesso != null) return ancora.idProcesso;
  if (ancora.idRequisicao) {
    const p = await tx.fato_processo_nf.findUnique({ where: { id_requisicao: ancora.idRequisicao }, select: { id_processo: true }});
    return p?.id_processo ?? null;
  }
  if (ancora.nfeId) {
    const x = await tx.xref_cobranca_nf.findFirst({ where: { id_enotas_nfe: String(ancora.nfeId) }, select: { id_processo: true }});
    return x?.id_processo ?? null;
  }
  return null;
}

async function upsertDestinatario(tx: Tx, d: DestinatarioInput) {
  const idDoc = d.id_doc.replace(/\D/g, '');
  const atual = await tx.dim_destinatario.findFirst({
    where: { id_doc_fiscal: idDoc, dt_fim_vigencia: null },
    orderBy: { dt_inicio_vigencia: 'desc' }
  });

  if (!atual) {
    const novo = await tx.dim_destinatario.create({
      data: {
        id_doc_fiscal: idDoc,
        nome_razao: d.nome_razao,
        uf: d.uf ?? null,
        municipio: d.municipio ?? null,
        cep: d.cep ?? null,
        dt_inicio_vigencia: new Date()
      },
      select: { id_destinatario: true }
    });
    return novo.id_destinatario;
  }

  const mudou =
    atual.nome_razao !== d.nome_razao ||
    atual.uf !== (d.uf ?? null) ||
    atual.municipio !== (d.municipio ?? null) ||
    atual.cep !== (d.cep ?? null);

  if (mudou) {
    await tx.dim_destinatario.update({ where: { id_destinatario: atual.id_destinatario }, data: { dt_fim_vigencia: new Date() }});
    const novo = await tx.dim_destinatario.create({
      data: {
        id_doc_fiscal: idDoc,
        nome_razao: d.nome_razao,
        uf: d.uf ?? null,
        municipio: d.municipio ?? null,
        cep: d.cep ?? null,
        dt_inicio_vigencia: new Date()
      },
      select: { id_destinatario: true }
    });
    return novo.id_destinatario;
  }

  return atual.id_destinatario;
}

export async function iniciarAcao(input: IniciarAcaoInput) {
  const origem = input.origem ?? OrigemEvento.API;

  return prisma.$transaction(async (tx) => {
    const idAcao = await idAcaoProc(tx, input.acao);
    const idOrig = await idOrigemEvento(tx, origem);
    const idTipoValOk = await idTipoEvento(tx, TipoEvento.VALIDACAO_OK);
    const idStValOk = await idStatusProcesso(tx, TipoEvento.VALIDACAO_OK);

    if (input.acao === AcaoProcesso.EMISSAO) {
      if (!input.idRequisicao) throw new Error('idRequisicao é obrigatório para EMISSAO');
      if (!input.emitente) throw new Error('emitente é obrigatório para EMISSAO');
      if (!input.dest) throw new Error('dest é obrigatório para EMISSAO');

      const quando = input.quando ?? new Date();
      const idData = utils.toIdData(quando);
      const existeData = await tx.dim_tempo.findUnique({ where: { id_data: idData }});
      if (!existeData) throw new Error(`DIM_TEMPO não contém a data ${idData}.`);

      await tx.dim_emitente.upsert({
        where: { cnpj: input.emitente.cnpj },
        create: {
          cnpj: input.emitente.cnpj,
          razao_social: input.emitente.razao_social,
          ie: input.emitente.ie ?? null,
          uf: input.emitente.uf ?? null,
          municipio: input.emitente.municipio ?? null,
          ativo: true
        },
        update: {
          razao_social: input.emitente.razao_social,
          ie: input.emitente.ie ?? null,
          uf: input.emitente.uf ?? null,
          municipio: input.emitente.municipio ?? null
        }
      });

      const emit = await tx.dim_emitente.findUnique({ where: { cnpj: input.emitente.cnpj }, select: { id_emitente: true }});
      const idDest = await upsertDestinatario(tx, input.dest);

      await tx.fato_processo_nf.upsert({
        where: { id_requisicao: input.idRequisicao },
        create: {
          id_requisicao: input.idRequisicao,
          id_emitente: emit!.id_emitente,
          id_destinatario: idDest,
          id_data_solicitacao: idData,
          id_status_processo: idStValOk,
          id_acao_processo: idAcao,
          valor_total_pedido: input.valorTotal ?? null
        },
        update: { dh_atualizacao: new Date(), id_acao_processo: idAcao }
      });

      const proc = await tx.fato_processo_nf.findUnique({ where: { id_requisicao: input.idRequisicao }, select: { id_processo: true }});

      if (input.idCobranca) {
        try {
          await tx.xref_cobranca_nf.create({
            data: { id_cobranca_monolito: input.idCobranca, id_processo: proc!.id_processo }
          });
        } catch (e: any) {
          if (e?.code !== 'P2002') throw e;
        }
      }

      await tx.evento_processo_nf.create({
        data: {
          id_processo: proc!.id_processo,
          id_origem_evento: idOrig,
          id_tipo_evento: idTipoValOk,
          id_acao_processo: idAcao
        }
      });

      return { idProcesso: proc!.id_processo };
    }

    const idProc = await resolveIdProcesso(tx, input.ancora);
    if (!idProc) throw new Error(`Processo não encontrado para ação ${input.acao}`);

    await tx.fato_processo_nf.update({
      where: { id_processo: idProc },
      data: { id_status_processo: idStValOk, id_acao_processo: idAcao, dh_atualizacao: new Date() }
    });

    await tx.evento_processo_nf.create({
      data: {
        id_processo: idProc,
        id_origem_evento: idOrig,
        id_tipo_evento: idTipoValOk,
        id_acao_processo: idAcao
      }
    });

    return { idProcesso: idProc };
  });
}

export async function registrarRetornoApi(input: RegistrarRetornoApiInput) {
  return prisma.$transaction(async (tx) => {
    const idProc = await resolveIdProcesso(tx, input.ancora);
    if (!idProc) throw new Error('Processo não encontrado');

    const origem = OrigemEvento.ENOTAS_API;
    const tipo = (input.httpStatus >= 200 && input.httpStatus < 300) ? TipoEvento.SUBMETIDA : TipoEvento.ENOTAS_ERRO;

    const [idOrig, idTipoEv, idAcao, idSt] = await Promise.all([
      idOrigemEvento(tx, origem),
      idTipoEvento(tx, tipo),
      idAcaoProc(tx, input.acao),
      idStatusProcesso(tx, tipo),
    ]);

    await tx.evento_processo_nf.create({
      data: {
        id_processo: idProc,
        id_origem_evento: idOrig,
        id_tipo_evento: idTipoEv,
        id_acao_processo: idAcao,
        http_status: input.httpStatus,
        codigo_erro: input.codigoErro ?? null,
        mensagem_erro: input.mensagemErro ?? null,
        payload_json: input.payload ?? null
      }
    });

    await tx.fato_processo_nf.update({
      where: { id_processo: idProc },
      data: { id_status_processo: idSt, id_acao_processo: idAcao, dh_atualizacao: new Date() }
    });

    if (input.acao === AcaoProcesso.EMISSAO) {
      const dataToUpdate: any = { dh_atualizacao: new Date() };
      if (typeof input.ambiente !== 'undefined') dataToUpdate.ambiente_emissao = String(input.ambiente) as any;

      if (input.formaPagamento) {
        const mp = await tx.dim_meio_pagamento.findUnique({ where: { codigo: input.formaPagamento }});
        const idMeio = mp ? mp.id_meio_pagamento : (await tx.dim_meio_pagamento.create({
          data: { codigo: input.formaPagamento, descricao: null }
        })).id_meio_pagamento;
        dataToUpdate.id_meio_pagamento = idMeio;
      }

      await tx.fato_processo_nf.update({ where: { id_processo: idProc }, data: dataToUpdate });

      const nfeId = input?.payload?.id ?? input?.payload?.nfeId;
      if (nfeId) {
        await tx.xref_cobranca_nf.updateMany({
          where: { id_processo: idProc },
          data: { id_enotas_nfe: String(nfeId) }
        });
      }
    }
  });
}

export async function processarWebhookNfe(input: ProcessarWebhookNfeInput) {
  return prisma.$transaction(async (tx) => {
    if (!input.nfeId) throw new Error('Webhook sem nfeId');

    const xref = await tx.xref_cobranca_nf.findFirst({
      where: { id_enotas_nfe: String(input.nfeId) },
      select: { id_processo: true }
    });
    if (!xref) throw new Error('XREF não encontrado para nfeId; tente reentrega');

    const proc = await tx.fato_processo_nf.findUnique({
      where: { id_processo: xref.id_processo },
      select: {
        id_processo: true,
        id_emitente: true,
        id_destinatario: true,
        id_nf: true,
        valor_total_pedido: true,
        ambiente_emissao: true,
        id_meio_pagamento: true
      }
    });
    if (!proc) throw new Error('Processo não encontrado');

    const origem = OrigemEvento.ENOTAS_WEBHOOK;

    const tipoEvento: TipoEvento =
      input.tipo === 'INUTILIZACAO' ? TipoEvento.INUTILIZADA :
      input.nfeStatus === 'Autorizada' ? TipoEvento.AUTORIZADA :
      input.nfeStatus === 'Negada'     ? TipoEvento.REJEITADA :
      input.nfeStatus === 'Cancelada'  ? TipoEvento.CANCELADA :
                                         TipoEvento.ENOTAS_ERRO;

    const acaoCodigo: AcaoProcesso =
      input.tipo === 'CANCELAMENTO'   ? AcaoProcesso.CANCELAMENTO :
      input.tipo === 'INUTILIZACAO'   ? AcaoProcesso.INUTILIZACAO :
      tipoEvento === TipoEvento.CANCELADA ? AcaoProcesso.CANCELAMENTO :
      AcaoProcesso.EMISSAO;

    const [idOrig, idTipoEv, idAcao] = await Promise.all([
      idOrigemEvento(tx, origem),
      idTipoEvento(tx, tipoEvento),
      idAcaoProc(tx, acaoCodigo),
    ]);

    await tx.evento_processo_nf.create({
      data: {
        id_processo: proc.id_processo,
        id_origem_evento: idOrig,
        id_tipo_evento: idTipoEv,
        id_acao_processo: idAcao,
        http_status: 200,
        codigo_erro: input.nfeMotivoStatus ?? null,
        mensagem_erro: input.nfeMotivoStatus ?? null,
        payload_json: input.raw ?? null
      }
    });

    if (tipoEvento === TipoEvento.AUTORIZADA) {
      const stNfe = await tx.dim_status_nfe.findFirst({ where: { codigo: 'AUTORIZADA' }, select: { id_status_nfe: true }});
      if (!stNfe) throw new Error('DIM_STATUS_NFE precisa conter "AUTORIZADA"');

      const dh = input.nfeDataEmissao ? new Date(input.nfeDataEmissao) : new Date();
      const idData = utils.toIdData(dh);
      const existeData = await tx.dim_tempo.findUnique({ where: { id_data: idData }});
      if (!existeData) throw new Error(`DIM_TEMPO não contém a data ${idData}.`);

      const numero = input.nfeNumero != null ? Number(input.nfeNumero) : null;
      const serie  = input.nfeSerie  != null ? Number(input.nfeSerie)  : null;
      const ambiente = (proc.ambiente_emissao ?? input.hintAmbiente ?? 'Producao') as TipoAmbienteEmissao;
      const idMeio   = proc.id_meio_pagamento ?? null;

      const nf = await tx.fato_nf.upsert({
        where: { id_enotas_nfe: String(input.nfeId) },
        create: {
          id_enotas_nfe: String(input.nfeId),
          chave_acesso: input.nfeChaveAcesso ?? null,
          numero, serie, modelo: '55',
          id_data_emissao: idData,
          id_emitente: proc.id_emitente,
          id_destinatario: proc.id_destinatario,
          id_meio_pagamento: idMeio,
          id_status_nfe: stNfe.id_status_nfe,
          valor_total: proc.valor_total_pedido ?? 0,
          descontos: null,
          valor_impostos: null,
          cfop_padrao: null,
          ncm_padrao: null,
          ambiente_emissao: ambiente
        },
        update: {
          chave_acesso: input.nfeChaveAcesso ?? null,
          numero, serie,
          id_data_emissao: idData,
          id_status_nfe: stNfe.id_status_nfe,
          id_meio_pagamento: idMeio,
          ambiente_emissao: ambiente
        }
      });

      if (!proc.id_nf) {
        await tx.fato_processo_nf.update({
          where: { id_processo: proc.id_processo },
          data: { id_nf: nf.id_nf, id_acao_processo: idAcao, dh_atualizacao: new Date() }
        });
      } else {
        await tx.fato_processo_nf.update({
          where: { id_processo: proc.id_processo },
          data: { id_acao_processo: idAcao, dh_atualizacao: new Date() }
        });
      }

      await tx.xref_cobranca_nf.updateMany({
        where: { id_processo: proc.id_processo },
        data: { id_nf: nf.id_nf, id_enotas_nfe: String(input.nfeId) }
      });

      return;
    }

    if (tipoEvento === TipoEvento.REJEITADA) {
      const idSt = await idStatusProcesso(tx, TipoEvento.REJEITADA);
      await tx.fato_processo_nf.update({
        where: { id_processo: proc.id_processo },
        data: { id_status_processo: idSt, id_acao_processo: idAcao, dh_atualizacao: new Date() }
      });
      return;
    }

    if (tipoEvento === TipoEvento.CANCELADA) {
      const stNfe = await tx.dim_status_nfe.findFirst({ where: { codigo: 'CANCELADA' }, select: { id_status_nfe: true }});
      if (!stNfe) throw new Error('DIM_STATUS_NFE precisa conter "CANCELADA"');

      await tx.fato_nf.updateMany({
        where: { id_enotas_nfe: String(input.nfeId) },
        data: { id_status_nfe: stNfe.id_status_nfe }
      });

      const idSt = await idStatusProcesso(tx, TipoEvento.CANCELADA);
      await tx.fato_processo_nf.update({
        where: { id_processo: proc.id_processo },
        data: { id_status_processo: idSt, id_acao_processo: idAcao, dh_atualizacao: new Date() }
      });
      return;
    }

    if (tipoEvento === TipoEvento.INUTILIZADA) {
      const idSt = await idStatusProcesso(tx, TipoEvento.INUTILIZADA);
      await tx.fato_processo_nf.update({
        where: { id_processo: proc.id_processo },
        data: { id_status_processo: idSt, id_acao_processo: idAcao, dh_atualizacao: new Date() }
      });
      return;
    }
  });
}

export async function registrarFalhaLocalDW(params: {
  ancora: Ancora;
  mensagem?: string | null;
  codigo?: string | null;
  valorTotal?: number | null;
  idDataSolicitacao?: number;
  idEmitente?: number;
  idDestinatario?: number;
  acao?: AcaoProcesso;
}) {
  const { ancora, mensagem, codigo, valorTotal, idDataSolicitacao, idEmitente, idDestinatario, acao = AcaoProcesso.EMISSAO } = params;

  await prisma.$transaction(async (tx) => {
    const [idStFalha, idOrigApi, idTipoFalha, idAcao] = await Promise.all([
      idStatusProcesso(tx, TipoEvento.VALIDACAO_FALHA),
      idOrigemEvento(tx, OrigemEvento.API),
      idTipoEvento(tx, TipoEvento.VALIDACAO_FALHA),
      idAcaoProc(tx, acao),
    ]);

    let idProc = await resolveIdProcesso(tx, ancora);

    if (idProc != null) {
      await tx.evento_processo_nf.create({
        data: {
          id_processo: idProc,
          id_origem_evento: idOrigApi,
          id_tipo_evento: idTipoFalha,
          id_acao_processo: idAcao,
          codigo_erro: codigo ?? null,
          mensagem_erro: mensagem ?? 'Falha desconhecida',
        },
      });
      await tx.fato_processo_nf.update({
        where: { id_processo: idProc },
        data: { id_status_processo: idStFalha, id_acao_processo: idAcao, dh_atualizacao: new Date() },
      });
      return;
    }

    if (ancora.idRequisicao && idEmitente && idDestinatario && idDataSolicitacao) {
      const novo = await tx.fato_processo_nf.create({
        data: {
          id_requisicao: ancora.idRequisicao,
          id_emitente: idEmitente,
          id_destinatario: idDestinatario,
          id_data_solicitacao: idDataSolicitacao,
          id_status_processo: idStFalha,
          id_acao_processo: idAcao,
          valor_total_pedido: valorTotal ?? null,
        },
      });
      await tx.evento_processo_nf.create({
        data: {
          id_processo: novo.id_processo,
          id_origem_evento: idOrigApi,
          id_tipo_evento: idTipoFalha,
          id_acao_processo: idAcao,
          codigo_erro: codigo ?? null,
          mensagem_erro: mensagem ?? 'Falha desconhecida',
        },
      });
    }
  });
}

export async function processoJaConcluido(opts: {
  correlationId?: string;    
  ancora?: Ancora;
  acao: AcaoProcesso;
}): Promise<boolean> {
  return prisma.$transaction(async (tx) => {
    let proc: { id_processo: bigint, id_status_processo: number } | null = null;

    if (opts.correlationId) {
      proc = await tx.fato_processo_nf.findFirst({
        where: { id_requisicao: opts.correlationId },
        orderBy: { id_processo: "desc" },
        select: { id_processo: true, id_status_processo: true }
      });
    }

    if (!proc && opts.ancora) {
      if (opts.ancora.idProcesso) {
        proc = await tx.fato_processo_nf.findUnique({
          where: { id_processo: opts.ancora.idProcesso },
          select: { id_processo: true, id_status_processo: true }
        });
      }
      if (!proc && opts.ancora.nfeId) {
        const x = await tx.xref_cobranca_nf.findFirst({
          where: { id_enotas_nfe: String(opts.ancora.nfeId) },
          select: { id_processo: true }
        });
        if (x) {
          proc = await tx.fato_processo_nf.findUnique({
            where: { id_processo: x.id_processo },
            select: { id_processo: true, id_status_processo: true }
          });
        }
      }
      if (!proc && opts.ancora.idRequisicao) {
        proc = await tx.fato_processo_nf.findFirst({
          where: { id_requisicao: opts.ancora.idRequisicao },
          orderBy: { id_processo: "desc" },
          select: { id_processo: true, id_status_processo: true }
        });
      }
    }

    if (!proc) return false;

    const st = await tx.dim_status_processo.findFirst({
      where: { id_status_processo: proc.id_status_processo },
      select: { codigo: true }
    });
    if (!st) return false;

    const finais = new Set([
      "AUTORIZADA","REJEITADA","CANCELADA","INUTILIZADA","ENOTAS_ERRO"
    ]);
    return finais.has(st.codigo);
  });
}