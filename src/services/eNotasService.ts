import { enotasApi } from "../infra/eNotasApi";
import { NotaFiscalProduto } from "../models/nfe/NotaFiscalProduto";
import { NotaFiscalServico } from "../models/nfes/NotaFiscalServico";
import { InutilizarNotaFiscalDTO } from "../schemas/body/InutilizarNotaFiscal.schema";

class EnotasService {
    private async call<T = any>(
        operacao: string,
        method: "get" | "post" | "put" | "delete",
        rota: string,
        payload?: unknown
    ): Promise<T> {
        try {
            const res = await enotasApi.request<T>({ method, url: rota, data: payload });
            return res.config.data || res.data;
        } catch (err: any) {
            const status = err?.response?.status ?? 500;
            const details = err?.response?.data ?? err?.message ?? "Erro desconhecido";

            const e = new Error(`[eNotas] ${operacao} falhou (${status})`);
            (e as any).status = status;
            (e as any).details = details;
            throw e;
        }
    }

    async buscarNfeIdInterno(empresaId: string, notaId: string) {
        const rota = `/v1/empresas/${empresaId}/nfes/porIdExterno/${notaId}`

        return this.call("Buscar NF por ID Interno", "get", rota);
    }

    async buscarNfeIdEnotas(empresaId: string, notaId: string) {
        const rota = `/v1/empresas/${empresaId}/nfes/${notaId}`
        
        return this.call("Buscar NF por ID Enotas", "get", rota);
    }

    async cancelarNfeIdInterno(empresaId: string, notaId: string) {
        const rota = `/v1/empresas/${empresaId}/nfes/porIdExterno/${notaId}`

        return this.call("Cancelar NF por ID Interno", "delete", rota);
    }

    async cancelarNfeIdEnotas(empresaId: string, notaId: string) {
        const rota = `/v1/empresas/${empresaId}/nfes/${notaId}`
       
        return this.call("Cancelar NF por ID Enotas", "delete", rota);
    }

    async emitirNFes(idEnotas: string, notaFiscalServico: NotaFiscalServico) {
        const rota = `/v1/empresas/${idEnotas}/nfes`

        return this.call("Emitir NFS-e", "post", rota, notaFiscalServico)
    }

    async emitirNfe(notaFiscalProduto: NotaFiscalProduto) {
        const rota = `/v2/empresas/${process.env.HAPPY_ENOTAS_KEY}/nf-e`

        return this.call("Emitir NF-e", "post", rota, notaFiscalProduto)
    }

    async inutilizarNfe(dto: InutilizarNotaFiscalDTO){
        const rota = `/v2/empresas/${process.env.HAPPY_ENOTAS_KEY}/nf-e/inutilizacoes`

        return this.call("Inutilizar NF-e", "post", rota, dto)
    };

    async consultarEmpresa(idEnotas: string) {
        const rota = `/v1/empresas/${idEnotas}`

        return this.call("Consultar Empresa", "get", rota)
    }
}

export default new EnotasService();