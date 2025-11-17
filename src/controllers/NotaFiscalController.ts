import type { Request, Response } from "express";
import notaFiscalService from "../services/NotaFiscalService";

type Params = { id: string };

class NotaFiscalController {
  async hello(req: Request, res: Response) {
    res.json({ message: "API de emissões de Notas Fiscais Happy" });
  }

  async buscarNota(req: Request<Params>, res: Response) {
    const { id: notaId } = req.params;
    const { empresaId, tipoId } = req.headers as any;

    try {
      const nota = await notaFiscalService.buscarNota(empresaId, notaId, tipoId);
      return res.status(200).json(nota);
    } catch (err: any) {
      const status = err?.response?.status ?? 500;
      return res.status(status).json({
        message: "Erro ao consultar nota no eNotas",
        details: err?.response?.data ?? err.message
      });
    }
  }

  async emitirNota(req: Request, res: Response) {
    try {
      await notaFiscalService.emitirNota(req.body);
      res.status(201).json({ message: "Nota fiscal criada com sucesso " + JSON.stringify(req.body.idCobranca) });
    } catch (err: any) {
      const status = err?.response?.status ?? 500
      res.status(status).json({
        message: "Erro ao emitir a nota fiscal",
        details: err?.response?.data ?? err.message
      })
    }
  }
  
  async cancelarNota(req: Request<Params>, res: Response) {
    const { id: notaId } = req.params;
    const { empresaId, tipoId } = req.headers as any;

    try {
      const nota = await notaFiscalService.cancelarNota(empresaId, notaId, tipoId);
      return res.status(200).json(nota);
    } catch (err: any) {
      const status = err?.response?.status ?? 500;
      return res.status(status).json({
        message: "Erro ao consultar nota no eNotas",
        details: err?.response?.data ?? err.message
      });
    }
  }

  async inutilizarNota(req: Request, res: Response) {
    try{
      await notaFiscalService.inutilizarNota(req.body);
      res.status(200).json({message: `Nota fiscal ${req.body.id} inutilizada com sucesso`});
    }catch(err: any){
      const status = err?.response?.status ?? 500;
      return res.status(status).json({
        message: "Erro ao Inutilizar nota no eNotas",
        details: err?.response?.data ?? err.message
      });
    }
  }
}

export default new NotaFiscalController();
