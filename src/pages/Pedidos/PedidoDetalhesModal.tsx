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
            <div className={styles.detalhes_container}>
                {error && <div className="alert-error">{error}</div>}

                <div className={styles.detalhes_header}>
                    <div>
                        <p className={styles.detalhe_label}>Fornecedor</p>
                        <p className={styles.detalhe_valor}>{pedido.fornecedores?.razao_social || "Desconhecido"}</p>
                    </div>
                    <div>
                        <p className={styles.detalhe_label}>Data do Pedido</p>
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
                            {pedido.status}
                        </Badge>
                    </div>
                    <div>
                        <p className={styles.detalhe_label}>Valor Total</p>
                        <p className={styles.detalhe_valor}>{formatCurrency(pedido.valor_total)}</p>
                    </div>
                </div>

                <div className={`table-container ${styles.mt8}`}>
                    <h3 className={styles.modal_subtitle} style={{ padding: "16px 16px 0", margin: 0 }}>
                        Itens do Pedido
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
                            {pedido.itens_pedido?.map((item) => (
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

                {isRecebivel && (
                    <div className={styles.form_actions_lg}>
                        <Button type="button" variant="primary" onClick={handleReceber} disabled={loading}>
                            <CheckCircle size={18} className={styles.mr2} />
                            {loading ? "Processando..." : "Receber Pedido"}
                        </Button>
                    </div>
                )}
            </div>
        </Modal>
    );
}
