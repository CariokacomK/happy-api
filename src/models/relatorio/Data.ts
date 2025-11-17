import { Cliente } from "../comum/Cliente"; 

export interface Data{
    id: string;
    tipo: string;
    idExterno: string;
    status: string;
    motivoStatus: string;
    ambienteProducao: string;
    enviadaPorEmail: boolean;
    dataAutorizacao: string;
    dataCriacao: string;
    cliente: Cliente;
    numero: string;
    serie: string;
    linkDownloadPdf: string;
    linkDownloadXML: string;
    naturezaOperacao: string;
    valorCofins: number;
    valorCsll: number;
    valorInss: number;
    valorIr: number;
    valorPis: number;
    deducoes: number;
    descontos: number;
    outrasRetencoes: number;
    valorTotal: number;
    valorIss: number;
    chaveAcesso: string;
}