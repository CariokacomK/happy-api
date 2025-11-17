import { CredenciadoraCartao } from "./CredenciadoraCartao";

export interface Forma{
    tipo: string;
    valor: number;
    credenciadoraCartao?: CredenciadoraCartao
    descricao?: string | null;
}