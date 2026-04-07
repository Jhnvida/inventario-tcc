import type { StatusEstoque } from "~/types";

export function statusEstoque(estoque: number, minimo: number): StatusEstoque {
    if (estoque >= minimo) return "ok";
    if (estoque / minimo >= 0.4) return "alerta";
    return "critico";
}
