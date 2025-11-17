import { Cliente } from "../comum/Cliente";
import { TipoAmbienteEmissao } from "../comum/TipoAmbienteEmissao";
import { TipoEmissao } from "../comum/TipoEmissao";
import { TipoPagamento } from "../comum/TipoPagamento";
export interface NotaFiscalDTO {
    id: string;
    idEnotas: string;
    idCobranca: string;
    tipoEmissao: TipoEmissao;
    tipoPagamento: TipoPagamento;
    ambienteEmissao: TipoAmbienteEmissao;
    naturezaOperacao: string;
    consumidorFinal: boolean;
    enviarPorEmail: boolean;
    valorTotal: number;
    cliente: Cliente;
}
//# sourceMappingURL=NotaFiscalDTO.d.ts.map