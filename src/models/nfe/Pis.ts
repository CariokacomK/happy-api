import { PorAliquota } from "./PorAliquota";

export interface Pis{
    situacaoTributaria: string;
    porAliquota?: PorAliquota;
}