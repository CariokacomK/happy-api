import { PorAliquota } from "./PorAliquota";

export interface Cofins{
    situacaoTributaria: string;
    porAliquota?: PorAliquota;
}
