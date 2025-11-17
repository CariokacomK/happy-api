import { Cliente } from "../comum/Cliente";
import { TipoAmbienteEmissao } from "../enum/TipoAmbienteEmissao";
import { TipoNota } from "../enum/TipoNota";
import { TipoPagamento } from "../enum/TipoPagamento";

export interface NotaFiscalDTO{
    id: string;
    idEnotas: string;
    idCobranca: string;
    tipoNota: TipoNota;
    tipoPagamento: TipoPagamento;
    ambienteEmissao: TipoAmbienteEmissao;
    naturezaOperacao: string;
    consumidorFinal: boolean;
    enviarPorEmail: boolean;
    valorTotal: number;
    cliente: Cliente;
}