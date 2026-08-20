import { CheckCircle } from "lucide-react";
import { useState } from "react";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";
import type { PedidoCompleto } from "../../hooks/usePedidos";
import { formatCurrency, formatDate } from "../../utils/formatters";
import styles from "./styles.module.css";

interface PedidoDetalhesModalProps {
    isOpen: boolean;
    onClose: () => void;
    pedido: PedidoCompleto | null;
    onReceberPedido: (id: string) => Promise<{ success: boolean; error?: string }>;
}

export function PedidoDetalhesModal({ isOpen, onClose, pedido, onReceberPedido }: PedidoDetalhesModalProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    if (!pedido) return null;

    const handleReceber = async () => {
        setLoading(true);
        setError("");
        const res = await onReceberPedido(pedido.id);
        if (res.success) {
            onClose();
        } else {
            setError(res.error || "Erro ao receber pedido.");
        }
        setLoading(false);
    };

    const isRecebivel = pedido.status === "enviado";

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Detalhes do Pedido - ${pedido.id.split("-")[0]}`}
            width="large"
        >
            <div className={styles.detalhesContainer}>
                {error && (
                    <div
                        style={{
                            padding: "1rem",
                            backgroundColor: "var(--status-critical-bg)",
                            color: "var(--status-critical-text)",
                            borderRadius: "8px",
                        }}
                    >
                        {error}
                    </div>
                )}

                <div className={styles.detalhesHeader}>
                    <div>
                        <p className={styles.detalheLabel}>Fornecedor</p>
                        <p className={styles.detalheValor}>{pedido.fornecedores?.razao_social || "Desconhecido"}</p>
                    </div>
                    <div>
                        <p className={styles.detalheLabel}>Data do Pedido</p>
                        <p className={styles.detalheValor}>{formatDate(pedido.criado_em)}</p>
                    </div>
                    <div>
                        <p className={styles.detalheLabel}>Status</p>
                        <Badge
                            variant={
                                pedido.status === "concluido"
                                    ? "success"
                                    : pedido.status === "cancelado"
                                      ? "critical"
                                      : "neutral"
                            }
                        >
                            {pedido.status}
                        </Badge>
                    </div>
                    <div>
                        <p className={styles.detalheLabel}>Valor Total</p>
                        <p className={styles.detalheValor}>{formatCurrency(pedido.valor_total)}</p>
                    </div>
                </div>

                <div className={styles.tableContainer} style={{ marginTop: "2rem" }}>
                    <h3 style={{ fontSize: "1rem", marginBottom: "1rem" }}>Itens do Pedido</h3>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Produto</th>
                                <th>SKU</th>
                                <th style={{ textAlign: "right" }}>Quantidade</th>
                                <th style={{ textAlign: "right" }}>Preço Unitário</th>
                                <th style={{ textAlign: "right" }}>Subtotal</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pedido.itens_pedido?.map((item) => (
                                <tr key={item.id}>
                                    <td className={styles.fw500}>{item.produtos?.nome}</td>
                                    <td className={styles.textSecondary}>{item.produtos?.sku}</td>
                                    <td style={{ textAlign: "right", fontWeight: 500 }}>{item.quantidade}</td>
                                    <td style={{ textAlign: "right" }}>{formatCurrency(item.preco_unitario)}</td>
                                    <td style={{ textAlign: "right", fontWeight: 600 }}>
                                        {formatCurrency(item.quantidade * item.preco_unitario)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem", marginTop: "2rem" }}>
                    <Button type="button" variant="ghost" onClick={onClose}>
                        Fechar
                    </Button>
                    {isRecebivel && (
                        <Button type="button" variant="primary" onClick={handleReceber} disabled={loading}>
                            <CheckCircle size={18} style={{ marginRight: "0.5rem" }} />
                            {loading ? "Processando..." : "Receber Pedido"}
                        </Button>
                    )}
                </div>
            </div>
        </Modal>
    );
}
