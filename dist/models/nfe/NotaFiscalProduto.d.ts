import { Cliente } from "../comum/Cliente";
import { NfeReferenciada } from "./NfeReferenciada";
import { Pedido } from "./Pedido";
import { Item } from "./Item";
import { DadosAdicionaisEmail } from "../comum/DadosAdicionaisEmail";
import { TipoAmbienteEmissao } from "../comum/TipoAmbienteEmissao";
export interface NotaFiscalProduto {
    idExterno: string;
    tipo?: string;
    tipoOperacao: string;
    finalidade: string;
    dataEmissao?: Date;
    dataCriacao?: Date;
    cliente: Cliente;
    informacoesAdicionais?: string;
    nfeReferenciada?: NfeReferenciada;
    pedido: Pedido;
    itens: Item[];
    status?: string;
    motivoStatus?: string;
    dataAutorizacao?: string;
    linkDanfe?: string;
    linkDownloadXml?: string;
    serie?: string;
    numero?: string;
    chaveAcesso?: string;
    enviadaPorEmail?: boolean;
    dadosAdicionaisEmail?: DadosAdicionaisEmail;
    ambienteEmissao: TipoAmbienteEmissao;
}
//# sourceMappingURL=NotaFiscalProduto.d.ts.map