import { Forma } from "./Forma";

export interface Pagamento{
    tipo: string;
    formas: Forma[];
}