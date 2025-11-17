"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const NotaFiscalService_1 = __importDefault(require("../services/NotaFiscalService"));
class NotaFiscalController {
    async hello(req, res) {
        res.json({ message: "API de emissões de Notas Fiscais Happy" });
    }
    async buscarNota(req, res) {
        const { id: notaId } = req.params;
        const empresaId = req.header("x-empresa-id");
        const tipoNota = req.header("x-tipo-nota");
        if (!empresaId) {
            return res.status(400).json({ message: "Header 'x-empresa-id' é obrigatório" });
        }
        if (!tipoNota) {
            return res.status(400).json({ message: "Header 'x-tipo-nota' é obrigatório" });
        }
        try {
            const nota = await NotaFiscalService_1.default.buscarNota(empresaId, notaId, tipoNota);
            return res.json(nota);
        }
        catch (err) {
            const status = err?.response?.status ?? 500;
            return res.status(status).json({
                message: "Erro ao consultar nota no eNotas",
                details: err?.response?.data ?? err.message
            });
        }
    }
    async emitirNota(req, res) {
        try {
            const response = await NotaFiscalService_1.default.emitirNota(req.body);
            res.status(201).json({ message: "Nota fiscal criada com sucesso " + JSON.stringify(response) });
        }
        catch (err) {
            const status = err?.response?.status ?? 500;
            res.status(status).json({
                message: "Erro ao emitir a nota fiscal",
                details: err?.response?.data ?? err.message
            });
        }
    }
    async update(req, res) {
        const { id } = req.params;
        res.json({ message: `Atualizar nota fiscal com ID ${id}` });
    }
    async delete(req, res) {
        const { id } = req.params;
        res.json({ message: `Deletar nota fiscal com ID ${id}` });
    }
}
exports.default = new NotaFiscalController();
//# sourceMappingURL=notaFiscalController.js.map