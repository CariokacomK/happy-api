import { Impostos } from "./Impostos";

export interface Item{
    cfop: string;
    codigo: string;
    descricao: string;
    sku?: string;
    ncm: string;
    cest: string;
    quantidade: number;
    unidadeMedia: string;
    valorUnitario: number;
    frete: number;
    impostos: Impostos;
    informacoesAdicionais?: string;
    codigoBeneficioFiscal: string;
}