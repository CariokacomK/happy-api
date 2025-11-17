import { z } from "zod";
import { TipoEmissao } from "../models/comum/TipoEmissao";
import { TipoAmbienteEmissao } from "../models/comum/TipoAmbienteEmissao";
import { TipoPagamento } from "../models/comum/TipoPagamento";
export declare const EnderecoSchema: z.ZodObject<{
    pais: z.ZodString;
    uf: z.ZodString;
    cidade: z.ZodString;
    logradouro: z.ZodString;
    numero: z.ZodString;
    complemento: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    bairro: z.ZodDefault<z.ZodString>;
    cep: z.ZodPipe<z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>, z.ZodString>;
}, z.core.$strip>;
export declare const ClienteSchema: z.ZodObject<{
    tipoPessoa: z.ZodString;
    nome: z.ZodString;
    email: z.ZodEmail;
    cpfCnpj: z.ZodPipe<z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>, z.ZodString>;
    inscricaoMunicipal: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    inscricaoEstadual: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    indicadorContribuinteICMS: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    telefone: z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>;
    endereco: z.ZodObject<{
        pais: z.ZodString;
        uf: z.ZodString;
        cidade: z.ZodString;
        logradouro: z.ZodString;
        numero: z.ZodString;
        complemento: z.ZodDefault<z.ZodOptional<z.ZodString>>;
        bairro: z.ZodDefault<z.ZodString>;
        cep: z.ZodPipe<z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>, z.ZodString>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const NotaFiscalSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    idEnotas: z.ZodString;
    idCobranca: z.ZodString;
    tipoEmissao: z.ZodEnum<typeof TipoEmissao>;
    TipoPagamento: z.ZodEnum<typeof TipoPagamento>;
    ambienteEmissao: z.ZodEnum<typeof TipoAmbienteEmissao>;
    naturezaOperacao: z.ZodOptional<z.ZodString>;
    consumidorFinal: z.ZodBoolean;
    enviarPorEmail: z.ZodDefault<z.ZodBoolean>;
    valorTotal: z.ZodCoercedNumber<unknown>;
    cliente: z.ZodObject<{
        tipoPessoa: z.ZodString;
        nome: z.ZodString;
        email: z.ZodEmail;
        cpfCnpj: z.ZodPipe<z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>, z.ZodString>;
        inscricaoMunicipal: z.ZodDefault<z.ZodOptional<z.ZodString>>;
        inscricaoEstadual: z.ZodDefault<z.ZodOptional<z.ZodString>>;
        indicadorContribuinteICMS: z.ZodDefault<z.ZodOptional<z.ZodString>>;
        telefone: z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>;
        endereco: z.ZodObject<{
            pais: z.ZodString;
            uf: z.ZodString;
            cidade: z.ZodString;
            logradouro: z.ZodString;
            numero: z.ZodString;
            complemento: z.ZodDefault<z.ZodOptional<z.ZodString>>;
            bairro: z.ZodDefault<z.ZodString>;
            cep: z.ZodPipe<z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>, z.ZodString>;
        }, z.core.$strip>;
    }, z.core.$strip>;
}, z.core.$strip>;
export type NotaFiscalDTO = z.infer<typeof NotaFiscalSchema>;
//# sourceMappingURL=NotaFiscal.schema.d.ts.map