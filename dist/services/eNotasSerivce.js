"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const eNotasApi_1 = require("../infra/eNotasApi");
class EnotasService {
    async emitirNFes(idEnotas, notaFiscalServico) {
        const rota = `/v1/empresas/${idEnotas}/nfes`;
        try {
            const { data } = await eNotasApi_1.enotasApi.post(rota, notaFiscalServico);
            return data;
        }
        catch (err) {
            const status = err?.response?.status ?? 500;
            const details = err?.response?.data ?? err?.message ?? "Erro desconhecido";
            throw err;
        }
    }
    async emitirNfe(notaFiscalProduto) {
        const rota = `/v2/empresas/${process.env.HAPPY_ENOTAS_KEY}`;
        try {
            const { data } = await eNotasApi_1.enotasApi.post(rota, notaFiscalProduto);
        }
        catch (err) {
            const status = err?.response?.status ?? 500;
            const details = err?.response?.data ?? err?.message ?? "Erro desconhecido";
            throw err;
        }
    }
    async consultarEmpresa(idEnotas) {
        const rota = `/v1/empresas/${idEnotas}`;
        try {
            const { data } = await eNotasApi_1.enotasApi.get(rota);
            return data;
        }
        catch (err) {
            const status = err?.response?.status ?? 500;
            const details = err?.response?.data ?? err?.message ?? "Erro desconhecido";
            throw err;
        }
    }
}
exports.default = new EnotasService();
//# sourceMappingURL=eNotasSerivce.js.map