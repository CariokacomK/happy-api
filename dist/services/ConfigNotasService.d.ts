import { Cliente } from "../models/comum/Cliente";
import { TipoPagamento } from "../models/comum/TipoPagamento";
import { Item } from "../models/nfe/Item";
import { Pedido } from "../models/nfe/Pedido";
declare class ConfigNotasService {
    montarPedido(tipoPagamento: TipoPagamento, valor: number): Pedido;
    montarItem(cliente: Cliente, idCobranca: string, valor: number): Promise<Item>;
    private montarImpostos;
}
declare const _default: ConfigNotasService;
export default _default;
//# sourceMappingURL=ConfigNotasService.d.ts.map