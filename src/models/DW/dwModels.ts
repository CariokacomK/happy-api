import { TipoAmbienteEmissao } from "../enum/TipoAmbienteEmissao";
import { WebhookStatus } from "../enum/WebhookStatus";

export enum OrigemEvento {
  API = 'API',
  ENOTAS_API = 'ENOTAS_API',
  ENOTAS_WEBHOOK = 'ENOTAS_WEBHOOK',
}

export enum TipoEvento {
  VALIDACAO_OK = 'VALIDACAO_OK',
  VALIDACAO_FALHA = 'VALIDACAO_FALHA',
  SUBMETIDA = 'SUBMETIDA',
  ENOTAS_ERRO = 'ENOTAS_ERRO',
  AUTORIZADA = 'AUTORIZADA',
  REJEITADA = 'REJEITADA',
  CANCELADA = 'CANCELADA',
  INUTILIZADA = 'INUTILIZADA',
}

export enum AcaoProcesso {
  EMISSAO = 'EMISSAO',
  CANCELAMENTO = 'CANCELAMENTO',
  INUTILIZACAO = 'INUTILIZACAO',
  CONSULTA = 'CONSULTA',
  CCE = 'CCE',
}

export interface Ancora {
  idRequisicao?: string;
  idProcesso?: bigint;
  nfeId?: string;
}

export interface EmitenteInput {
  cnpj: string;
  razao_social: string;
  ie?: string | null;
  uf?: string | null;
  municipio?: string | null;
}

export interface DestinatarioInput {
  id_doc: string;
  nome_razao: string;
  uf?: string | null;
  municipio?: string | null;
  cep?: string | null;
}

export interface IniciarAcaoInput {
  acao: AcaoProcesso;
  origem?: OrigemEvento;
  idRequisicao?: string;
  quando?: Date;
  idCobranca?: string | null;
  valorTotal?: number | null;
  emitente?: EmitenteInput;
  dest?: DestinatarioInput;
  ancora?: Ancora;
}

export interface RegistrarRetornoApiInput {
  acao: AcaoProcesso;
  ancora: Ancora;
  httpStatus: number;
  payload?: any;
  codigoErro?: string | null;
  mensagemErro?: string | null;
  ambiente?: TipoAmbienteEmissao;
  formaPagamento?: string;
}

export interface ProcessarWebhookNfeInput {
  nfeId: string;
  nfeStatus?: WebhookStatus;
  nfeChaveAcesso?: string | null;
  nfeNumero?: string | number | null;
  nfeSerie?: string | number | null;
  nfeDataEmissao?: string | null;
  nfeMotivoStatus?: string | null;
  hintAmbiente?: TipoAmbienteEmissao | null;
  raw?: any;
  tipo?: 'CANCELAMENTO' | 'INUTILIZACAO';
}
