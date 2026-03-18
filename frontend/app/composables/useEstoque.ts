export function statusEstoque(estoque: number, minimo: number): "ok" | "alerta" | "critico" {
  if (estoque >= minimo) return "ok";
  if (estoque / minimo >= 0.4) return "alerta";
  return "critico";
}
