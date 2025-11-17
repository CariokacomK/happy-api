// utils/DwUtils.ts
import { prisma } from "../infra/prisma";
import { TipoId } from "../models/enum/TipoId";
import { InutilizarNotaFiscalDTO } from "../schemas/body/InutilizarNotaFiscal.schema";
import { Ancora } from "../models/DW/dwModels";

export async function resolveAncoraCancelamento(notaId: string, tipoId: TipoId): Promise<Ancora> {
  if (tipoId === TipoId.INTERNO) {
    try {
      const idNf = BigInt(notaId);
      const proc = await prisma.fato_processo_nf.findFirst({
        where: { id_nf: idNf },
        select: { id_processo: true },
      });
      if (proc) return { idProcesso: proc.id_processo };
    } catch {  }
  }
  return { nfeId: String(notaId) };
}

export function resolveAncoraInutilizacao(dto: InutilizarNotaFiscalDTO): Ancora {
  return { idRequisicao: String(dto.id) };
}