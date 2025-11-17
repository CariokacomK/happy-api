import { z } from "zod";
import { TipoAmbienteEmissao } from "../../models/enum/TipoAmbienteEmissao";
import utils from "../../utils/Utils";

export const InutilizarNotaFiscalSchema = z.object({
  id: z.string().trim().min(1, "ID é obrigatório"),
  ambienteEmissao: z.enum(TipoAmbienteEmissao),
  serie: z.string()
    .transform((v) => utils.onlyDigits(v))
    .pipe(z.string().regex(/^\d{1,3}$/, "série deve conter 1 a 3 dígitos")),
  numeroInicial: z.coerce.number().int().positive("numeroInicial deve ser > 0"),
  numeroFinal: z.coerce.number().int().positive("numeroFinal deve ser > 0"),
  justificativa: z.string().trim().min(15, "justificativa deve ter ao menos 15 caracteres")
})

export type InutilizarNotaFiscalDTO = z.infer<typeof InutilizarNotaFiscalSchema>;