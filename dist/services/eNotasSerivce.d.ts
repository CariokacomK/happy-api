import { NotaFiscalProduto } from "../models/nfe/NotaFiscalProduto";
import { NotaFiscalServico } from "../models/nfes/NotaFiscalServico";
declare class EnotasService {
    emitirNFes(idEnotas: string, notaFiscalServico: NotaFiscalServico): Promise<any>;
    emitirNfe(notaFiscalProduto: NotaFiscalProduto): Promise<void>;
    consultarEmpresa(idEnotas: string): Promise<any>;
}
declare const _default: EnotasService;
export default _default;
//# sourceMappingURL=eNotasSerivce.d.ts.map