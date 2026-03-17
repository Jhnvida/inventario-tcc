export function statusEstoque(estoque: number, minimo: number) {
  if (estoque >= minimo) return "ok";
  if (estoque / minimo >= 0.4) return "alerta";
  return "critico";
}

export function percentualEstoque(estoque: number, minimo: number) {
  return Math.min(100, Math.round((estoque / minimo) * 100));
}

export function corBarra(status: string) {
  if (status === "ok") return "#1E40AF";
  if (status === "alerta") return "#D97706";
  return "#DC2626";
}
