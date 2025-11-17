"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const notaFiscalController_1 = __importDefault(require("../controllers/notaFiscalController"));
const NotaFiscal_schema_1 = require("../schemas/NotaFiscal.schema");
const NotaFiscalValidacao_1 = require("../middleware/NotaFiscalValidacao");
const router = (0, express_1.Router)();
router.get("/", notaFiscalController_1.default.hello);
router.get("/:id", notaFiscalController_1.default.buscarNota);
router.post("/", (0, NotaFiscalValidacao_1.validateBody)(NotaFiscal_schema_1.NotaFiscalSchema), notaFiscalController_1.default.emitirNota);
router.put("/:id", notaFiscalController_1.default.update);
router.delete("/:id", notaFiscalController_1.default.delete);
exports.default = router;
//# sourceMappingURL=notaFiscalRoutes.js.map