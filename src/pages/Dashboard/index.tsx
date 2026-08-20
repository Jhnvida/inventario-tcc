import { AlertTriangle, ArrowRightLeft, DollarSign, Package, ShoppingCart } from "lucide-react";
import { Badge } from "../../components/ui/Badge";
import { Card } from "../../components/ui/Card";
import { useDashboard } from "../../hooks/useDashboard";
import { formatCurrency, formatDate } from "../../utils/formatters";
import styles from "./styles.module.css";

export function Dashboard() {
    const { loading, metricas, itensCriticos, movimentacoesRecentes } = useDashboard();

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.spinner}></div>
                <p>Carregando métricas...</p>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>Visão Geral</h1>
                <p className={styles.subtitle}>Resumo do seu inventário e movimentações recentes.</p>
            </header>

            <div className={styles.metricsGrid}>
                <Card className={styles.metricCard}>
                    <div className={styles.metricIcon} style={{ backgroundColor: "#e0e7ff", color: "#4f46e5" }}>
                        <DollarSign size={24} />
                    </div>
                    <div className={styles.metricInfo}>
                        <p className={styles.metricLabel}>Valor Total do Estoque</p>
                        <h3 className={styles.metricValue}>{formatCurrency(metricas.valorTotal)}</h3>
                    </div>
                </Card>

                <Card className={styles.metricCard}>
                    <div className={styles.metricIcon} style={{ backgroundColor: "#dcfce7", color: "#16a34a" }}>
                        <Package size={24} />
                    </div>
                    <div className={styles.metricInfo}>
                        <p className={styles.metricLabel}>Total de Produtos</p>
                        <h3 className={styles.metricValue}>{metricas.totalProdutos}</h3>
                    </div>
                </Card>

                <Card className={styles.metricCard}>
                    <div className={styles.metricIcon} style={{ backgroundColor: "#fee2e2", color: "#dc2626" }}>
                        <AlertTriangle size={24} />
                    </div>
                    <div className={styles.metricInfo}>
                        <p className={styles.metricLabel}>Estoque Crítico</p>
                        <h3 className={styles.metricValue}>{metricas.estoqueCritico}</h3>
                    </div>
                </Card>

                <Card className={styles.metricCard}>
                    <div className={styles.metricIcon} style={{ backgroundColor: "#fef3c7", color: "#d97706" }}>
                        <ShoppingCart size={24} />
                    </div>
                    <div className={styles.metricInfo}>
                        <p className={styles.metricLabel}>Pedidos em Aberto</p>
                        <h3 className={styles.metricValue}>{metricas.pedidosAbertos}</h3>
                    </div>
                </Card>
            </div>

            <div className={styles.tablesGrid}>
                <Card className={styles.tableCard} padding="none">
                    <div className={styles.cardHeader}>
                        <h3 className={styles.cardTitle}>
                            <AlertTriangle size={18} color="#dc2626" />
                            Itens em Nível Crítico
                        </h3>
                    </div>
                    <div className={styles.tableContainer}>
                        {itensCriticos.length === 0 ? (
                            <div className={styles.emptyState}>Nenhum produto em nível crítico.</div>
                        ) : (
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>Produto</th>
                                        <th>SKU</th>
                                        <th style={{ textAlign: "right" }}>Estoque</th>
                                        <th style={{ textAlign: "right" }}>Mínimo</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {itensCriticos.map((item) => (
                                        <tr key={item.id}>
                                            <td className={styles.fw500}>{item.nome}</td>
                                            <td className={styles.textSecondary}>{item.sku}</td>
                                            <td style={{ textAlign: "right" }}>
                                                <Badge variant="critical">{item.quantidade}</Badge>
                                            </td>
                                            <td style={{ textAlign: "right", color: "var(--text-secondary)" }}>
                                                {item.estoque_minimo}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </Card>

                <Card className={styles.tableCard} padding="none">
                    <div className={styles.cardHeader}>
                        <h3 className={styles.cardTitle}>
                            <ArrowRightLeft size={18} color="#2563eb" />
                            Movimentações Recentes
                        </h3>
                    </div>
                    <div className={styles.tableContainer}>
                        {movimentacoesRecentes.length === 0 ? (
                            <div className={styles.emptyState}>Nenhuma movimentação registrada.</div>
                        ) : (
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>Data</th>
                                        <th>Produto</th>
                                        <th>Tipo</th>
                                        <th style={{ textAlign: "right" }}>Qtd</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {movimentacoesRecentes.map((mov) => (
                                        <tr key={mov.id}>
                                            <td className={styles.textSecondary}>{formatDate(mov.criada_em)}</td>
                                            <td className={styles.fw500}>{mov.produtos?.nome || "Desconhecido"}</td>
                                            <td>
                                                <Badge variant={mov.tipo === "entrada" ? "success" : "critical"}>
                                                    {mov.tipo}
                                                </Badge>
                                            </td>
                                            <td style={{ textAlign: "right", fontWeight: 600 }}>
                                                {mov.tipo === "entrada" ? "+" : "-"}
                                                {mov.quantidade}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
}
