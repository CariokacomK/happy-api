import { Cofins } from "./Cofins";
import { Icms } from "./Icms";
import { Ipi } from "./Ipi";
import { PercentualAproximadoTributos } from "./PercentualAproximadoTributos";
import { Pis } from "./Pis";

export interface Impostos{
    percentualAproximadoTributos: PercentualAproximadoTributos;
    icms: Icms;
    pis: Pis
    cofins: Cofins;
    ipi?: Ipi;
}