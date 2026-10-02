import { AlertCircle, CheckCircle, XCircle } from "lucide-react";
import { useState } from "react";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";
import type { PedidoVendaCompleto } from "../../hooks/usePedidosVenda";
import { formatCurrency, formatDate } from "../../utils/formatters";
import styles from "./styles.module.css";

interface PedidoVendaDetalhesModalProps {
    isOpen: boolean;
    onClose: () => void;
    pedido: PedidoVendaCompleto | null;
    onFinalizarVenda: (id: string) => Promise<{ success: boolean; error?: string }>;
    onCancelarVenda: (id: string) => Promise<{ success: boolean; error?: string }>;
}

export function PedidoVendaDetalhesModal({
    isOpen,
    onClose,
    pedido,
    onFinalizarVenda,
    onCancelarVenda,
}: PedidoVendaDetalhesModalProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    if (!pedido) return null;

    async function handleFinalizar() {
        if (!pedido) return;
        if (!window.confirm("Deseja finalizar esta venda? O estoque dos produtos será baixado automaticamente."))
            return;

        setLoading(true);
        setError("");
        const res = await onFinalizarVenda(pedido.id);
        if (res.success) {
            onClose();
        } else {
            setError(res.error || "Erro ao finalizar pedido de venda.");
        }
        setLoading(false);
    }

    async function handleCancelar() {
        if (!pedido) return;
        if (!window.confirm("Tem certeza que deseja cancelar este pedido de venda?")) return;

        setLoading(true);
        setError("");
        const res = await onCancelarVenda(pedido.id);
        if (res.success) {
            onClose();
        } else {
            setError(res.error || "Erro ao cancelar pedido de venda.");
        }
        setLoading(false);
    }

    const isRascunho = pedido.status === "rascunho";

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Detalhes da Venda #${pedido.numero || pedido.id.slice(0, 8)}`}
            width="large"
        >
            <div className={styles.detalhes_container}>
                {error && (
                    <div className="alert-error" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <AlertCircle size={18} />
                        <span>{error}</span>
                    </div>
                )}

                <div className={styles.detalhes_header}>
                    <div>
                        <p className={styles.detalhe_label}>Cliente</p>
                        <p className={styles.detalhe_valor}>{pedido.clientes?.nome || "Não informado"}</p>
                    </div>
                    <div>
                        <p className={styles.detalhe_label}>Data da Venda</p>
                        <p className={styles.detalhe_valor}>{formatDate(pedido.criado_em)}</p>
                    </div>
                    <div>
                        <p className={styles.detalhe_label}>Status</p>
                        <Badge
                            variant={
                                pedido.status === "concluido"
                                    ? "success"
                                    : pedido.status === "cancelado"
                                      ? "critical"
                                      : "neutral"
                            }
                        >
                            {pedido.status === "concluido"
                                ? "Concluído"
                                : pedido.status === "cancelado"
                                  ? "Cancelado"
                                  : "Rascunho"}
                        </Badge>
                    </div>
                    <div>
                        <p className={styles.detalhe_label}>Valor Total</p>
                        <p className={styles.detalhe_valor} style={{ color: "var(--color-primary)" }}>
                            {formatCurrency(pedido.valor_total)}
                        </p>
                    </div>
                </div>

                {pedido.observacoes && (
                    <div
                        style={{
                            padding: "12px 16px",
                            backgroundColor: "var(--color-surface)",
                            borderRadius: "var(--radius-md)",
                            border: "1px solid var(--color-border)",
                        }}
                    >
                        <p className={styles.detalhe_label}>Observações</p>
                        <p style={{ margin: 0, fontSize: "0.95rem" }}>{pedido.observacoes}</p>
                    </div>
                )}

                <div className={`table-container ${styles.mt8}`}>
                    <h3 className={styles.modal_subtitle} style={{ padding: "16px 16px 0", margin: 0 }}>
                        Produtos Vendidos
                    </h3>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Produto</th>
                                <th>SKU</th>
                                <th className="text-right">Quantidade</th>
                                <th className="text-right">Preço Unitário</th>
                                <th className="text-right">Subtotal</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pedido.itens_pedido_venda?.map((item) => (
                                <tr key={item.id}>
                                    <td className="fw500">{item.produtos?.nome}</td>
                                    <td className="text-secondary">{item.produtos?.sku}</td>
                                    <td className="text-right fw500">{item.quantidade}</td>
                                    <td className="text-right">{formatCurrency(item.preco_unitario)}</td>
                                    <td className="text-right fw600">
                                        {formatCurrency(item.quantidade * item.preco_unitario)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {isRascunho && (
                    <div
                        className={styles.form_actions}
                        style={{ justifyContent: "space-between", alignItems: "center" }}
                    >
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={handleCancelar}
                            disabled={loading}
                            style={{ color: "var(--color-danger-text)" }}
                        >
                            <XCircle size={18} className={styles.mr2} />
                            Cancelar Venda
                        </Button>

                        <Button type="button" variant="primary" onClick={handleFinalizar} disabled={loading}>
                            <CheckCircle size={18} className={styles.mr2} />
                            {loading ? "Processando..." : "Finalizar Venda (Baixar Estoque)"}
                        </Button>
                    </div>
                )}
            </div>
        </Modal>
    );
}
