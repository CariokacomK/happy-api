import { z } from "zod";
import { TipoNota } from "../../models/enum/TipoNota";
import { TipoAmbienteEmissao } from "../../models/enum/TipoAmbienteEmissao";
import { TipoPagamento } from "../../models/enum/TipoPagamento";
import utils from "../../utils/Utils";

export const EnderecoSchema = z.object({
  pais: z.string().regex(/^[A-Z]{2}$/, "Use a sigla ISO 3166-1 alfa-2 (2 letras, ex.: BR, US)"),
  uf: z.string().min(2, "UF obrigatória"),
  cidade: z.string().min(1, "cidade obrigatória"),
  logradouro: z.string().min(1, "logradouro obrigatório"),
  numero: z.string().min(1, "número obrigatório"),
  complemento: z.string().optional().default(""),
  bairro: z.string().default("Não Informado"),
  cep: z.string()
    .transform(v => utils.onlyDigits(v))
    .pipe(z.string().regex(/^\d{8}$/, "CEP deve ter 8 dígitos"))
});

export const ClienteSchema = z.object({
  tipoPessoa: z.string().min(1, "tipoPessoa obrigatório"),
  nome: z.string().min(1, "nome obrigatório"),
  email: z.email().min(1, "Email Obrigatório"),
  cpfCnpj: z.string()
    .transform(v => utils.onlyDigits(v))
    .pipe(z.string().regex(/^\d{11}$|^\d{14}$/, "cpfCnpj deve ter 11 (CPF) ou 14 (CNPJ) dígitos")),
  inscricaoMunicipal: z.string().optional().default(""),
  inscricaoEstadual: z.string().optional().default(""),
  indicadorContribuinteICMS: z.string().optional().default(""),
  telefone: z.string()
    .transform(v => utils.onlyDigits(v)),
  endereco: EnderecoSchema
});

export const NotaFiscalSchema = z.object({
  id: z.string().optional(),
  idEnotas: z.string().min(1, "Identificador Enotas Obrigatório"),
  idCobranca: z.string().min(1, "Identificador Cobranca é Obrigatório"),
  tipoEmissao: z.enum(TipoNota),
  tipoPagamento: z.enum(TipoPagamento),
  ambienteEmissao: z.enum(TipoAmbienteEmissao),
  naturezaOperacao: z.string().optional(),
  consumidorFinal: z.boolean(),
  enviarPorEmail: z.boolean().default(true),
  valorTotal: z.coerce.number().positive("valorTotal deve ser > 0"),
  cliente: ClienteSchema
});

export type NotaFiscalDTO = z.infer<typeof NotaFiscalSchema>;
