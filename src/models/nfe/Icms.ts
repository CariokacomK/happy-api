export interface Icms{
    situacaoTributaria: string;
    origem?: number;
    aliquota?: number;
    baseCalculo?: number;
    modalidadeBaseCalculo?: number;
    percentualReducaoBaseCalculo?: number;
    baseCalculoST?: number;
    aliquotaST?: number;
    modalidadeBaseCalculoST?: number;
    percentualReducaoBaseCalculoST?: number;
    percentualMargemValorAdicionadoST?: number;
}