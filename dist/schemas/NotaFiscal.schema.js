"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotaFiscalSchema = exports.ClienteSchema = exports.EnderecoSchema = void 0;
const zod_1 = require("zod");
const TipoEmissao_1 = require("../models/comum/TipoEmissao");
const TipoAmbienteEmissao_1 = require("../models/comum/TipoAmbienteEmissao");
const TipoPagamento_1 = require("../models/comum/TipoPagamento");
const onlyDigits = (s) => s.replace(/\D+/g, "");
exports.EnderecoSchema = zod_1.z.object({
    pais: zod_1.z.string().min(1, "pais obrigatório"),
    uf: zod_1.z.string().min(2, "UF obrigatória"),
    cidade: zod_1.z.string().min(1, "cidade obrigatória"),
    logradouro: zod_1.z.string().min(1, "logradouro obrigatório"),
    numero: zod_1.z.string().min(1, "número obrigatório"),
    complemento: zod_1.z.string().optional().default(""),
    bairro: zod_1.z.string().default("Não Informado"),
    cep: zod_1.z.string()
        .transform(v => onlyDigits(v))
        .pipe(zod_1.z.string().regex(/^\d{8}$/, "CEP deve ter 8 dígitos"))
});
exports.ClienteSchema = zod_1.z.object({
    tipoPessoa: zod_1.z.string().min(1, "tipoPessoa obrigatório"),
    nome: zod_1.z.string().min(1, "nome obrigatório"),
    email: zod_1.z.email().min(1, "Email Obrigatório"),
    cpfCnpj: zod_1.z.string()
        .transform(v => onlyDigits(v))
        .pipe(zod_1.z.string().regex(/^\d{11}$|^\d{14}$/, "cpfCnpj deve ter 11 (CPF) ou 14 (CNPJ) dígitos")),
    inscricaoMunicipal: zod_1.z.string().optional().default(""),
    inscricaoEstadual: zod_1.z.string().optional().default(""),
    indicadorContribuinteICMS: zod_1.z.string().optional().default(""),
    telefone: zod_1.z.string()
        .transform(v => onlyDigits(v)),
    endereco: exports.EnderecoSchema
});
exports.NotaFiscalSchema = zod_1.z.object({
    id: zod_1.z.string().optional(),
    idEnotas: zod_1.z.string().min(1, "Identificador Enotas Obrigatório"),
    idCobranca: zod_1.z.string().min(1, "Identificador Cobranca é Obrigatório"),
    tipoEmissao: zod_1.z.enum(TipoEmissao_1.TipoEmissao),
    TipoPagamento: zod_1.z.enum(TipoPagamento_1.TipoPagamento),
    ambienteEmissao: zod_1.z.enum(TipoAmbienteEmissao_1.TipoAmbienteEmissao),
    naturezaOperacao: zod_1.z.string().optional(),
    consumidorFinal: zod_1.z.boolean(),
    enviarPorEmail: zod_1.z.boolean().default(true),
    valorTotal: zod_1.z.coerce.number().positive("valorTotal deve ser > 0"),
    cliente: exports.ClienteSchema
});
//# sourceMappingURL=NotaFiscal.schema.js.map