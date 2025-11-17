import type { Request, Response } from "express";
type Params = {
    id: string;
};
declare class NotaFiscalController {
    hello(req: Request, res: Response): Promise<void>;
    buscarNota(req: Request<Params>, res: Response): Promise<Response<any, Record<string, any>>>;
    emitirNota(req: Request, res: Response): Promise<void>;
    update(req: Request, res: Response): Promise<void>;
    delete(req: Request, res: Response): Promise<void>;
}
declare const _default: NotaFiscalController;
export default _default;
//# sourceMappingURL=notaFiscalController.d.ts.map