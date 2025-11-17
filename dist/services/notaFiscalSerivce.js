"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const ENOTAS_API = "https://api.enotasgw.com.br/";
const API_KEY = process.env.ENOTAS_API_KEY || "NzEwMDg5NGYtYmE2Zi00ODM1LTkyMzktNmVlMTY2NmQwNzAw";
const api = axios_1.default.create({
    baseURL: ENOTAS_API,
    headers: {
        "Authorization": `Basic ${API_KEY}`,
        "Content-Type": "application/json"
    }
});
class EnotasService {
    async getNotaById(empresaId, notaId, tipoNota) {
        console.log(`/empresas/${empresaId}/${tipoNota === 'S' ? 'nfes' : 'nf-e'}/${notaId}`);
        const { data } = await api.get(`/empresas/${empresaId}/${tipoNota === 'S' ? 'nfes' : 'nf-e'}/${notaId}`);
        return data;
    }
}
exports.default = new EnotasService();
//# sourceMappingURL=notaFiscalSerivce.js.map