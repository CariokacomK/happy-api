import { NotaFiscalDTO } from "../schemas/NotaFiscal.schema";
declare class NotaFiscalService {
    buscarNota(empresaId: string, notaId: string, tipoNota: string): Promise<any>;
    emitirNota(dto: NotaFiscalDTO): Promise<any>;
    private montarCorpoNota;
    private emitirNotaFiscalServico;
    private emitirNotaFiscalProduto;
}
declare const _default: NotaFiscalService;
export default _default;
//# sourceMappingURL=NotaFiscalService.d.ts.map