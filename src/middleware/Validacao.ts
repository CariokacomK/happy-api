import type { NextFunction, Request, Response } from "express";
import { z } from "zod";

export function validateBody<S extends z.ZodTypeAny>(
  schema: S, 
  pick: (req: Request) => unknown = (req) => req.body
) {
  return (req: Request, res: Response, next: NextFunction) => {
    const parsed = schema.safeParse(pick(req));

    if (!parsed.success) {
      return res.status(400).json({
        message: "Payload inválido",
        issues: parsed.error.issues.map(i => ({
          path: i.path.join("."),
          code: i.code,
          message: i.message,
        })),
      });
    }

    req.body = parsed.data as z.infer<S>;    
    next();
  };
}

export function validateHeaders<S extends z.ZodTypeAny>(schema: S, pick: (req: Request) => unknown){
  return (req: Request, res: Response, next: NextFunction) => {
    const parsed = schema.safeParse(pick(req));
    
    if(!parsed.success){
      return res.status(400).json({
        message: "Headers inválidos",
        issues: parsed.error.issues.map(i => ({
          path: i.path.join("."),
          code: i.code,
          message: i.message,
        })),
      });
    }

    req.headers = parsed.data as any;
    next();
  }
}
