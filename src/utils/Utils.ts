class Utils {
    public onlyDigits(s: string) {
        return s.replace(/\D+/g, "");
    }

    public first = (v: unknown) => Array.isArray(v) ? v[0] : v;

    public httpFromErr(err: any) {
        const raw = err?.status ?? err?.response?.status ?? err?.code ?? 500;
        const n = Number(raw);
        return Number.isFinite(n) ? n : 500;
    }
    
    public toIdData = (d: Date) => Number(d.toISOString().slice(0, 10).replace(/-/g, ''));

}

export default new Utils();