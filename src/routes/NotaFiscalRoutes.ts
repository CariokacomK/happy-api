import { Router } from "express";
import notaFiscalController from "../controllers/NotaFiscalController";
import notaFiscalCommandController from "../controllers/NotaFiscalCommandController";
import { NotaFiscalSchema } from "../schemas/body/NotaFiscal.schema";
import { NotaHeadersSchema } from "../schemas/header/BuscarNota.schema";
import { validateBody, validateHeaders } from "../middleware/Validacao";
import { InutilizarNotaFiscalSchema } from "../schemas/body/InutilizarNotaFiscal.schema";
import NotaFiscalCommandController from "../controllers/NotaFiscalCommandController";

const router = Router();

router.get("/", notaFiscalController.hello);

router.get("/:id", validateHeaders(NotaHeadersSchema, 
    (req) => ({
        empresaId: req.header("x-empresa-id"),
        tipoId: req.header("x-tipo-id")
    })
),notaFiscalController.buscarNota);

router.post("/emitir", validateBody(NotaFiscalSchema),NotaFiscalCommandController.emitir);

router.delete("/:id", validateHeaders(NotaHeadersSchema,
    (req) => ({
        empresaId: req.header("x-empresa-id"),
        tipoId: req.header("x-tipo-id")
    })
),NotaFiscalCommandController.cancelar); 

router.post("/inutilizar", validateBody(InutilizarNotaFiscalSchema), notaFiscalCommandController.inutilizar);

export default router;