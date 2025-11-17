import { Cliente } from "../models/comum/Cliente";
import { Empresa } from "../models/comum/Empresa";
import { TipoPagamento } from "../models/enum/TipoPagamento";
import { Impostos } from "../models/nfe/Impostos";
import { Item } from "../models/nfe/Item";
import { Pedido } from "../models/nfe/Pedido";
import eNotasService from "./eNotasService";

class ConfigNotasService {
  public async montarPedido(tipoPagamento: TipoPagamento, valor: number) {
    const recorrente: boolean = (tipoPagamento === 3)

    const tipoPagamentoDesc = this.tipoPagamentoDesc(tipoPagamento);

    const pedido: Pedido = {
      presencaConsumidor: "OperacaoNaoPresencial",
      pagamento: {
        tipo: recorrente ? "PagamentoAPrazo" : "PagamentoAVista",
        formas: [
          {
            tipo: tipoPagamentoDesc,
            valor: valor,
            descricao: (tipoPagamentoDesc === "Outros") ? "Outra forma de pagamento" : null
          }
        ]
      }
    }

    return pedido;
  }

  public tipoPagamentoDesc(tipoPagamento: TipoPagamento) {
    let tipoPagamentoDesc: string;

    switch (tipoPagamento) {
      case 1 || 3:
        tipoPagamentoDesc = "CartaoDeCredito"
        break;

      case 2:
        tipoPagamentoDesc = "CartaoDeDebito"
        break;

      case 4:
        tipoPagamentoDesc = "BoletoBancario"
        break;

      case 5:
        tipoPagamentoDesc = "PagamentoInstantaneoPix"
        break;

      default:
        tipoPagamentoDesc = "Outros"
        break;
    }

    return tipoPagamentoDesc;
  }

  public async montarItem(cliente: Cliente, idCobranca: string, valor: number) {
    const item: Item = {
      cfop: cliente.endereco.pais != "BR" ? "7102" :
        cliente.endereco.uf === "PR" ? "5102" : "6102",
      codigo: idCobranca,
      descricao: "Licença do Material Didático",
      quantidade: 1,
      unidadeMedia: "UN",
      valorUnitario: valor,
      ncm: "49019900",
      cest: "2806400",
      frete: 0,
      impostos: await this.montarImpostos(),
      codigoBeneficioFiscal: "PR800001",
    }

    return item;
  }

  private async montarImpostos() {
    const empresa = await this.encontrarEmpresa(process.env.HAPPY_ENOTAS_KEY || '');
    const impostos: Impostos = {
      percentualAproximadoTributos: { simplificado: { percentual: 0 } },
      icms: { situacaoTributaria: empresa?.optanteSimplesNacional ? "400" : "41" },
      pis: { situacaoTributaria: "07" },
      cofins: { situacaoTributaria: "07" }
    }

    return impostos;
  }

  public async encontrarEmpresa(idEmpresa: string): Promise<Empresa> {
    return await eNotasService.consultarEmpresa(idEmpresa) as Empresa
  }
}

export default new ConfigNotasService();