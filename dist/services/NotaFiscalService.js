"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const TipoEmissao_1 = require("../models/comum/TipoEmissao");
const eNotasSerivce_1 = __importDefault(require("./eNotasSerivce"));
const ConfigNotasService_1 = __importDefault(require("./ConfigNotasService"));
const ENOTAS_API = "https://api.enotasgw.com.br/";
const API_KEY = process.env.ENOTAS_API_KEY || "NzEwMDg5NGYtYmE2Zi00ODM1LTkyMzktNmVlMTY2NmQwNzAw";
const api = axios_1.default.create({
    baseURL: ENOTAS_API,
    headers: {
        "Authorization": `Basic ${API_KEY}`,
        "Content-Type": "application/json"
    }
});
class NotaFiscalService {
    async buscarNota(empresaId, notaId, tipoNota) {
        console.log(`/empresas/${empresaId}/${tipoNota === 'S' ? 'nfes' : 'nf-e'}/${notaId}`);
        const { data } = await api.get(`/empresas/${empresaId}/${tipoNota === 'S' ? 'nfes' : 'nf-e'}/${notaId}`);
        return data;
    }
    async emitirNota(dto) {
        return await this.montarCorpoNota(dto);
    }
    async montarCorpoNota(dto) {
        const cliente = dto.cliente;
        const servico = {
            descricao: "Pagamento de parcela do curso da Happy"
        };
        const valor = dto.valorTotal;
        const idEnotas = dto.idEnotas;
        const idCobranca = dto.idCobranca;
        const ambienteEmissao = dto.ambienteEmissao;
        const tipoPagamento = dto.TipoPagamento;
        return (dto.tipoEmissao === TipoEmissao_1.TipoEmissao.SERVICO) ?
            await this.emitirNotaFiscalServico(valor, cliente, servico, idEnotas, idCobranca, ambienteEmissao)
            :
                await this.emitirNotaFiscalProduto(valor, cliente, idCobranca, ambienteEmissao, tipoPagamento);
    }
    async emitirNotaFiscalServico(valor, cliente, servico, idEnotas, idCobranca, ambienteEmissao) {
        const notaFiscalSerivce = {
            cliente: cliente,
            idExterno: "Nfes" + idCobranca,
            servico: servico,
            valorTotal: valor,
            ambienteEmissao: ambienteEmissao
        };
        return await eNotasSerivce_1.default.emitirNFes(idEnotas, notaFiscalSerivce);
    }
    async emitirNotaFiscalProduto(valor, cliente, idCobranca, ambienteEmissao, TipoPagamento) {
        const notaFiscalProduto = {
            idExterno: "Nfe" + idCobranca,
            tipoOperacao: "Saida",
            finalidade: "Normal",
            cliente: cliente,
            pedido: await ConfigNotasService_1.default.montarPedido(TipoPagamento, valor),
            itens: [await ConfigNotasService_1.default.montarItem(cliente, idCobranca, valor)],
            enviadaPorEmail: false,
            ambienteEmissao: ambienteEmissao
        };
        return await eNotasSerivce_1.default.emitirNfe(notaFiscalProduto);
    }
}
exports.default = new NotaFiscalService();
//# sourceMappingURL=NotaFiscalService.js.map