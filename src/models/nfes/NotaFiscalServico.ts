import { Cliente } from "../comum/Cliente";
import { DadosAdicionaisEmail } from "../comum/DadosAdicionaisEmail";
import { TipoAmbienteEmissao } from "../enum/TipoAmbienteEmissao";
import { Servico } from "./Servico";

export interface NotaFiscalServico{
    cliente: Cliente;
    tipo?: string;
    idExterno: string;
    ambienteEmissao: TipoAmbienteEmissao;
    consumidorFinal?: boolean;
    indicadorPresencaConsumidor?: string;
    servico: Servico;
    idExternoSubstituir?: string;
    nfeIdSubstitituir?: string;
    numeroRps?: number;
    serieRps?: string;
    dataCompetencia?: Date;
    naturezaOperacao?: string;
    deducoes?: number;
    descontos?: number;
    valorTotal: number;
    observacoes?: string;
    linkDownloadPDF?: string;
    linkDownloadXML?: string;
    dadosAdicionaisEmail?: DadosAdicionaisEmail;
    status?: string;
    motivoStatus?: string;
    dataAutorizacao?: string;
    chaveAcesso?: string;
    dataCriacao?: Date;
}