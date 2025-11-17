import { Endereco } from './Endereco';

export interface Cliente {
  tipoPessoa: string; 
  nome: string;
  email: string;
  cpfCnpj: string;
  inscricaoMunicipal: string;
  inscricaoEstadual: string;
  indicadorContribuinteICMS: string;
  telefone: string;
  endereco: Endereco;
}
