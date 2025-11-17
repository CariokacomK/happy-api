import { Pagamento } from "./Pagamento";

export interface Pedido{
    presencaConsumidor: string;
    pagamento: Pagamento;
}