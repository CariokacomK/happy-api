import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
export declare function validateBody(schema: z.ZodTypeAny): (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
//# sourceMappingURL=NotaFiscalValidacao.d.ts.map