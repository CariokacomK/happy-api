import { randomUUID } from "crypto";
import { publishCommand } from "../mq/mqSingleton";

class NotaFiscalCommandController {
  async emitir(req: any, res: any) {
    const correlationId = req.body?.idRequisicao ?? req.body?.id ?? randomUUID();
    await publishCommand("emitir", {
      messageId: randomUUID(),
      correlationId,
      type: "EMITIR",
      payload: req.body,
      timestamp: new Date().toISOString(),
      version: 1
    });
    return res.status(202).json({ correlationId });
  }

  async cancelar(req: any, res: any) {
    const empresaId = req.header("x-empresa-id") ?? req.query.empresaId;
    const tipoId    = req.header("x-tipo-id")    ?? req.query.tipoId;
    if (!empresaId || !tipoId) return res.status(400).json({ message: "x-empresa-id e x-tipo-id obrigatórios" });

    const correlationId = `${empresaId}:${req.params.id}:${tipoId}`;
    await publishCommand("cancelar", {
      messageId: randomUUID(),
      correlationId,
      type: "CANCELAR",
      payload: { notaId: req.params.id, empresaId, tipoId },
      timestamp: new Date().toISOString(),
      version: 1
    });
    return res.status(202).json({ correlationId });
  }

  async inutilizar(req: any, res: any) {
    const correlationId = String(req.body?.id ?? randomUUID());
    await publishCommand("inutilizar", {
      messageId: randomUUID(),
      correlationId,
      type: "INUTILIZAR",
      payload: req.body,
      timestamp: new Date().toISOString(),
      version: 1
    });
    return res.status(202).json({ correlationId });
  }
}

export default new NotaFiscalCommandController();