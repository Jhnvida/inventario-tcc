import { AlertTriangle, DollarSign, Package, ShoppingCart } from "lucide-react";
import { Badge } from "../../components/ui/Badge";
import { Card } from "../../components/ui/Card";
import { useDashboard } from "../../hooks/useDashboard";
import { formatCurrency, formatDate } from "../../utils/formatters";
import styles from "./styles.module.css";

export function Dashboard() {
    const { loading, metricas, itensCriticos, movimentacoesRecentes } = useDashboard();

    if (loading) {
        return (
            <div className={styles.loading_container}>
                <div className={styles.spinner}></div>
                <p>Carregando métricas...</p>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div>
                    <h1 className={styles.title}>Visão Geral</h1>
                    <p className={styles.subtitle}>Resumo do seu inventário e movimentações recentes.</p>
                </div>
            </header>

            <div className={styles.metrics_grid}>
                <Card className={styles.metric_card} padding="medium">
                    <div className={styles.metric_header}>
                        <h3>Valor Total do Estoque</h3>
                        <DollarSign size={20} className={styles.metric_icon_neutral} />
                    </div>
                    <div className={styles.metric_value}>{formatCurrency(metricas.valorTotal)}</div>
                </Card>

                <Card className={styles.metric_card} padding="medium">
                    <div className={styles.metric_header}>
                        <h3>Total de Produtos</h3>
                        <Package size={20} className={styles.metric_icon_neutral} />
                    </div>
                    <div className={styles.metric_value}>{metricas.totalProdutos}</div>
                </Card>

                <Card className={styles.metric_card} padding="medium">
                    <div className={styles.metric_header}>
                        <h3>Estoque Crítico</h3>
                        <AlertTriangle
                            size={20}
                            className={
                                metricas.estoqueCritico > 0 ? styles.metric_icon_danger : styles.metric_icon_neutral
                            }
                        />
                    </div>
                    <div className={styles.metric_value}>{metricas.estoqueCritico}</div>
                </Card>

                <Card className={styles.metric_card} padding="medium">
                    <div className={styles.metric_header}>
                        <h3>Pedidos em Aberto</h3>
                        <ShoppingCart size={20} className={styles.metric_icon_neutral} />
                    </div>
                    <div className={styles.metric_value}>{metricas.pedidosAbertos}</div>
                </Card>
            </div>

            <div className={styles.tables_grid}>
                <div>
                    <h2 className={styles.section_title}>Itens em Nível Crítico</h2>
                    <div className={styles.table_container}>
                        {itensCriticos.length === 0 ? (
                            <div className={styles.empty_state}>Nenhum produto em nível crítico.</div>
                        ) : (
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>Produto / SKU</th>
                                        <th className={styles.text_right}>Estoque</th>
                                        <th className={styles.text_center}>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {itensCriticos.map((item) => (
                                        <tr key={item.id}>
                                            <td>
                                                <div className={styles.fw500}>{item.nome}</div>
                                                <div className={styles.text_monospace}>{item.sku}</div>
                                            </td>
                                            <td className={`${styles.text_right} ${styles.fw600}`}>
                                                {item.quantidade}{" "}
                                                <span className={`${styles.text_secondary} ${styles.fw400}`}>
                                                    / {item.estoque_minimo}
                                                </span>
                                            </td>
                                            <td className={styles.text_center}>
                                                <Badge variant="critical">Crítico</Badge>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                <div>
                    <h2 className={styles.section_title}>Movimentações Recentes</h2>
                    <div className={styles.table_container}>
                        {movimentacoesRecentes.length === 0 ? (
                            <div className={styles.empty_state}>Nenhuma movimentação registrada.</div>
                        ) : (
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>Tipo</th>
                                        <th>Produto</th>
                                        <th className={styles.text_right}>Qtd</th>
                                        <th>Data</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {movimentacoesRecentes.map((mov) => (
                                        <tr key={mov.id}>
                                            <td>
                                                <Badge variant={mov.tipo === "entrada" ? "success" : "critical"}>
                                                    {mov.tipo}
                                                </Badge>
                                            </td>
                                            <td className={styles.fw500}>{mov.produtos?.nome || "Desconhecido"}</td>
                                            <td
                                                className={`${mov.tipo === "entrada" ? styles.text_success : styles.text_danger} ${styles.text_right} ${styles.fw600}`}
                                            >
                                                {mov.tipo === "entrada" ? "+" : "-"}
                                                {mov.quantidade}
                                            </td>
                                            <td className={styles.text_secondary}>
                                                {formatDate(mov.criada_em).split(" ")[0]}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
