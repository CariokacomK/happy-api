import { TipoAmbienteEmissao } from "../enum/TipoAmbienteEmissao";

export interface InutilizarNotaFiscalDTO{
    id: string;
    ambienteEmissao: TipoAmbienteEmissao;
    serie: string;
    numeroInicial: number;
    numeroFinal: number;
    justificativa: string;
}