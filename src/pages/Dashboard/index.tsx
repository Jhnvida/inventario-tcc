import { AlertTriangle, DollarSign, Package, ShoppingCart } from "lucide-react";
import { motion } from "motion/react";
import { Badge } from "../../components/ui/Badge";
import { Card } from "../../components/ui/Card";
import { PageHeader } from "../../components/ui/PageHeader";
import { useDashboard } from "../../hooks/useDashboard";
import { formatCurrency, formatDate } from "../../utils/formatters";
import styles from "./styles.module.css";

export function Dashboard() {
    const { loading, metricas, itensCriticos, movimentacoesRecentes, userName } = useDashboard();

    return (
        <div className="page-container">
            <PageHeader
                title={`Olá, ${userName || "Usuário"}!`}
                subtitle="Resumo do seu inventário e movimentações recentes."
            />

            {loading ? (
                <div className="loading-state">Carregando métricas...</div>
            ) : (
                <>
                    <motion.div
                        className={styles.metrics_grid}
                        initial="hidden"
                        animate="visible"
                        variants={{
                            hidden: { opacity: 0 },
                            visible: {
                                opacity: 1,
                                transition: { staggerChildren: 0.1 },
                            },
                        }}
                    >
                        <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
                            <Card className={styles.metric_card} padding="medium">
                                <div className={styles.metric_header}>
                                    <h3>Valor Total do Estoque</h3>
                                    <DollarSign size={20} className={styles.metric_icon_neutral} />
                                </div>
                                <div className={styles.metric_value}>{formatCurrency(metricas.valorTotal)}</div>
                            </Card>
                        </motion.div>

                        <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
                            <Card className={styles.metric_card} padding="medium">
                                <div className={styles.metric_header}>
                                    <h3>Total de Produtos</h3>
                                    <Package size={20} className={styles.metric_icon_neutral} />
                                </div>
                                <div className={styles.metric_value}>{metricas.totalProdutos}</div>
                            </Card>
                        </motion.div>

                        <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
                            <Card className={styles.metric_card} padding="medium">
                                <div className={styles.metric_header}>
                                    <h3>Estoque Crítico</h3>
                                    <AlertTriangle
                                        size={20}
                                        className={
                                            metricas.estoqueCritico > 0
                                                ? styles.metric_icon_danger
                                                : styles.metric_icon_neutral
                                        }
                                    />
                                </div>
                                <div className={styles.metric_value}>{metricas.estoqueCritico}</div>
                            </Card>
                        </motion.div>

                        <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
                            <Card className={styles.metric_card} padding="medium">
                                <div className={styles.metric_header}>
                                    <h3>Pedidos em Aberto</h3>
                                    <ShoppingCart size={20} className={styles.metric_icon_neutral} />
                                </div>
                                <div className={styles.metric_value}>{metricas.pedidosAbertos}</div>
                            </Card>
                        </motion.div>
                    </motion.div>

                    <motion.div
                        className={styles.tables_grid}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.2 }}
                    >
                        <div>
                            <h2 className={styles.section_title}>Itens em Nível Crítico</h2>
                            <div className="table-container">
                                {itensCriticos.length === 0 ? (
                                    <div className="empty-state">Nenhum produto em nível crítico.</div>
                                ) : (
                                    <table className="data-table">
                                        <thead>
                                            <tr>
                                                <th>Produto / SKU</th>
                                                <th className="text-right">Estoque</th>
                                                <th className="text-center">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {itensCriticos.map((item) => (
                                                <tr key={item.id}>
                                                    <td>
                                                        <div className="fw500">{item.nome}</div>
                                                        <div className="text-monospace">{item.sku}</div>
                                                    </td>
                                                    <td className="text-right fw600">
                                                        {item.quantidade}{" "}
                                                        <span className="text-secondary fw400">
                                                            / {item.estoque_minimo}
                                                        </span>
                                                    </td>
                                                    <td className="text-center">
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
                            <div className="table-container">
                                {movimentacoesRecentes.length === 0 ? (
                                    <div className="empty-state">Nenhuma movimentação registrada.</div>
                                ) : (
                                    <table className="data-table">
                                        <thead>
                                            <tr>
                                                <th>Tipo</th>
                                                <th>Produto</th>
                                                <th className="text-right">Qtd</th>
                                                <th>Data</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {movimentacoesRecentes.map((mov) => (
                                                <tr key={mov.id}>
                                                    <td>
                                                        <Badge
                                                            variant={mov.tipo === "entrada" ? "success" : "critical"}
                                                        >
                                                            {mov.tipo}
                                                        </Badge>
                                                    </td>
                                                    <td className="fw500">{mov.produtos?.nome || "Desconhecido"}</td>
                                                    <td
                                                        className={`${mov.tipo === "entrada" ? styles.text_success : styles.text_danger} text-right fw600`}
                                                    >
                                                        {mov.tipo === "entrada" ? "+" : "-"}
                                                        {mov.quantidade}
                                                    </td>
                                                    <td className="text-secondary">
                                                        {formatDate(mov.criada_em).split(" ")[0]}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </div>
    );
}
