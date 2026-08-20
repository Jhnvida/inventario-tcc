import { Eye, Search } from "lucide-react";
import { useState } from "react";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { usePedidos, type PedidoCompleto } from "../../hooks/usePedidos";
import { formatCurrency, formatDate } from "../../utils/formatters";
import { PedidoDetalhesModal } from "./PedidoDetalhesModal";
import styles from "./styles.module.css";

export function Pedidos() {
    const { pedidos, loading, busca, setBusca, statusFiltro, setStatusFiltro, receberPedido } = usePedidos();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [pedidoSelecionado, setPedidoSelecionado] = useState<PedidoCompleto | null>(null);

    const handleOpenDetails = (pedido: PedidoCompleto) => {
        setPedidoSelecionado(pedido);
        setIsModalOpen(true);
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div>
                    <h1 className={styles.title}>Pedidos de Compra</h1>
                    <p className={styles.subtitle}>
                        Gerencie os pedidos junto aos fornecedores e controle os recebimentos.
                    </p>
                </div>
            </header>

            <Card className={styles.filterCard}>
                <div className={styles.filterGrid}>
                    <div className={styles.searchWrapper}>
                        <Search className={styles.searchIcon} size={18} />
                        <Input
                            placeholder="Buscar por fornecedor..."
                            value={busca}
                            onChange={(e) => setBusca(e.target.value)}
                            className={styles.searchInput}
                        />
                    </div>
                    <div>
                        <Select value={statusFiltro} onChange={(e) => setStatusFiltro(e.target.value)}>
                            <option value="">Todos os status</option>
                            <option value="rascunho">Rascunho</option>
                            <option value="enviado">Enviado</option>
                            <option value="concluido">Concluído</option>
                            <option value="cancelado">Cancelado</option>
                        </Select>
                    </div>
                </div>
            </Card>

            <Card padding="none" className={styles.tableCard}>
                <div className={styles.tableContainer}>
                    {loading ? (
                        <div className={styles.emptyState}>Carregando pedidos...</div>
                    ) : pedidos.length === 0 ? (
                        <div className={styles.emptyState}>Nenhum pedido encontrado.</div>
                    ) : (
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Data do Pedido</th>
                                    <th>Fornecedor</th>
                                    <th style={{ textAlign: "right" }}>Valor Total</th>
                                    <th>Status</th>
                                    <th style={{ textAlign: "center" }}>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pedidos.map((pedido) => (
                                    <tr key={pedido.id}>
                                        <td className={styles.textSecondary}>{formatDate(pedido.criado_em)}</td>
                                        <td className={styles.fw500}>{pedido.fornecedores?.razao_social || "-"}</td>
                                        <td style={{ textAlign: "right", fontWeight: 600 }}>
                                            {formatCurrency(pedido.valor_total)}
                                        </td>
                                        <td>
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
                                        </td>
                                        <td style={{ textAlign: "center" }}>
                                            <Button
                                                variant="ghost"
                                                onClick={() => handleOpenDetails(pedido)}
                                                title="Ver Detalhes"
                                            >
                                                <Eye size={16} />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </Card>

            <PedidoDetalhesModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                pedido={pedidoSelecionado}
                onReceberPedido={receberPedido}
            />
        </div>
    );
}
