import { CertificadoDigital } from "./CertificadoDigital";
import { Endereco } from "./Endereco";

export interface Empresa{
    id: string;
    status: string;
    prazo: number;
    dadosObrigatoriosPreenchidos: boolean;
    cnpj: string;
    inscricaoMunicipal: string;
    inscricaoEstadual: string;
    razaoSocial: string;
    nomeFantasia: string;
    optanteSimplesNacional: boolean;
    regimeEspecialTributacao: string;
    email: string;
    telefoneComercial: string;
    endereco: Endereco;
    incentivadorCultural: boolean;
    dataCriacao: Date;
    dataUltimaAlteracao: Date;
    certificadoDigital: CertificadoDigital;
}