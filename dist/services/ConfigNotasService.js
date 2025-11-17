"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const eNotasSerivce_1 = __importDefault(require("./eNotasSerivce"));
class ConfigNotasService {
    montarPedido(tipoPagamento, valor) {
        const recorrente = (tipoPagamento === 3);
        let tipoPagamentoDesc;
        switch (tipoPagamento) {
            case 1 || 3:
                tipoPagamentoDesc = "CartaoDeCredito";
                break;
            case 2:
                tipoPagamentoDesc = "CartaoDeDebito";
                break;
            case 4:
                tipoPagamentoDesc = "BoletoBancario";
                break;
            case 5:
                tipoPagamentoDesc = "PagamentoInstantaneoPix";
                break;
            default:
                tipoPagamentoDesc = "Outros";
                break;
        }
        const pedido = {
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
        };
        return pedido;
    }
    async montarItem(cliente, idCobranca, valor) {
        const item = {
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
        };
        return item;
    }
    async montarImpostos() {
        const empresa = await eNotasSerivce_1.default.consultarEmpresa(process.env.HAPPY_ENOTAS_KEY || "");
        const impostos = {
            percentualAproximadoTributos: { simplificado: { percentual: 0 } },
            icms: { situacaoTributaria: empresa?.optanteSimplesNacional ? "400" : "41" },
            pis: { situacaoTributaria: "07" },
            confins: { situacaoTributaria: "07" }
        };
        return impostos;
    }
}
exports.default = new ConfigNotasService();
//# sourceMappingURL=ConfigNotasService.js.map