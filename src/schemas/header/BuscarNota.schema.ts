import { z } from "zod";
import { TipoId } from "../../models/enum/TipoId";
import utils from "../../utils/Utils";

export const NotaHeadersSchema = z.object({
  empresaId: z.preprocess(
    (v) => String(utils.first(v) ?? ""),
    z.string().min(1, "Header 'x-empresa-id' é obrigatório")
  ),
  tipoId: z.preprocess(
    (v) => String(utils.first(v) ?? ""),
    z.enum(TipoId)
  )
});

export type BuscarNotaHeaders = z.infer<typeof NotaHeadersSchema>;