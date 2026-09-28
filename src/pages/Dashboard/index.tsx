import { AlertTriangle, DollarSign, Package, ShoppingCart } from "lucide-react";
import { motion } from "motion/react";
import { Badge } from "../../components/ui/Badge";
import { Card } from "../../components/ui/Card";
import { PageHeader } from "../../components/ui/PageHeader";
import { useDashboard } from "../../hooks/useDashboard";
import { formatCurrency, formatDate } from "../../utils/formatters";
import styles from "./styles.module.css";

export function Dashboard() {
    const { loading, metricas, itensCriticos, movimentacoesRecentes, userName, curvaABC } = useDashboard();

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
                        className={styles.curva_abc_section}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35, delay: 0.15 }}
                    >
                        <Card padding="medium">
                            <div className={styles.curva_abc_header}>
                                <div>
                                    <h3 className={styles.curva_abc_title}>Classificação Curva ABC</h3>
                                    <p className={styles.curva_abc_subtitle}>
                                        Concentração do capital imobilizado por relevância de valor (quantidade × preço)
                                    </p>
                                </div>
                            </div>

                            <div className={styles.abc_bar_wrapper}>
                                <div
                                    className={styles.abc_bar_a}
                                    style={{ width: `${Math.max(curvaABC.classes.A.percentualValor, 3)}%` }}
                                    title={`Classe A: ${curvaABC.classes.A.percentualValor}% do valor total`}
                                />
                                <div
                                    className={styles.abc_bar_b}
                                    style={{ width: `${Math.max(curvaABC.classes.B.percentualValor, 3)}%` }}
                                    title={`Classe B: ${curvaABC.classes.B.percentualValor}% do valor total`}
                                />
                                <div
                                    className={styles.abc_bar_c}
                                    style={{ width: `${Math.max(curvaABC.classes.C.percentualValor, 3)}%` }}
                                    title={`Classe C: ${curvaABC.classes.C.percentualValor}% do valor total`}
                                />
                            </div>

                            <div className={styles.abc_cards_grid}>
                                <div className={styles.abc_col}>
                                    <div className={styles.abc_col_header}>
                                        <span className={styles.dot_a} />
                                        <span className={styles.abc_name}>Classe A</span>
                                        <span className={styles.abc_pill}>Alto Impacto</span>
                                    </div>
                                    <div className={styles.abc_val}>
                                        {formatCurrency(curvaABC.classes.A.valorTotal)}
                                    </div>
                                    <div className={styles.abc_detail}>
                                        {curvaABC.classes.A.qtdProdutos} produtos (
                                        {curvaABC.classes.A.percentualProdutos}% dos itens) ·{" "}
                                        {curvaABC.classes.A.percentualValor}% do valor
                                    </div>
                                </div>

                                <div className={styles.abc_col}>
                                    <div className={styles.abc_col_header}>
                                        <span className={styles.dot_b} />
                                        <span className={styles.abc_name}>Classe B</span>
                                        <span className={styles.abc_pill}>Médio Impacto</span>
                                    </div>
                                    <div className={styles.abc_val}>
                                        {formatCurrency(curvaABC.classes.B.valorTotal)}
                                    </div>
                                    <div className={styles.abc_detail}>
                                        {curvaABC.classes.B.qtdProdutos} produtos (
                                        {curvaABC.classes.B.percentualProdutos}% dos itens) ·{" "}
                                        {curvaABC.classes.B.percentualValor}% do valor
                                    </div>
                                </div>

                                <div className={styles.abc_col}>
                                    <div className={styles.abc_col_header}>
                                        <span className={styles.dot_c} />
                                        <span className={styles.abc_name}>Classe C</span>
                                        <span className={styles.abc_pill}>Baixo Impacto</span>
                                    </div>
                                    <div className={styles.abc_val}>
                                        {formatCurrency(curvaABC.classes.C.valorTotal)}
                                    </div>
                                    <div className={styles.abc_detail}>
                                        {curvaABC.classes.C.qtdProdutos} produtos (
                                        {curvaABC.classes.C.percentualProdutos}% dos itens) ·{" "}
                                        {curvaABC.classes.C.percentualValor}% do valor
                                    </div>
                                </div>
                            </div>
                        </Card>
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
                                    <>
                                        <table className="data-table hidden-mobile">
                                            <thead>
                                                <tr>
                                                    <th>Produto / SKU</th>
                                                    <th className="text-right">Estoque</th>
                                                    <th className="text-center">Curva ABC</th>
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
                                                            <Badge
                                                                variant={
                                                                    item.classeABC === "A"
                                                                        ? "draft"
                                                                        : item.classeABC === "B"
                                                                          ? "warning"
                                                                          : "neutral"
                                                                }
                                                            >
                                                                Classe {item.classeABC || "C"}
                                                            </Badge>
                                                        </td>
                                                        <td className="text-center">
                                                            <Badge variant="critical">Crítico</Badge>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>

                                        <div className="mobile-cards-list mobile-only">
                                            {itensCriticos.map((item) => (
                                                <div key={item.id} className="mobile-card">
                                                    <div className="mobile-card-header">
                                                        <div>
                                                            <div className="mobile-card-title">{item.nome}</div>
                                                            <div className="mobile-card-subtitle">{item.sku}</div>
                                                        </div>
                                                        <Badge variant="critical">Crítico</Badge>
                                                    </div>
                                                    <div className="mobile-card-body">
                                                        <div className="mobile-card-row">
                                                            <span className="mobile-card-label">Curva ABC</span>
                                                            <span className="mobile-card-value">
                                                                <Badge
                                                                    variant={
                                                                        item.classeABC === "A"
                                                                            ? "draft"
                                                                            : item.classeABC === "B"
                                                                              ? "warning"
                                                                              : "neutral"
                                                                    }
                                                                >
                                                                    Classe {item.classeABC || "C"}
                                                                </Badge>
                                                            </span>
                                                        </div>
                                                        <div className="mobile-card-row">
                                                            <span className="mobile-card-label">Estoque</span>
                                                            <span
                                                                className="mobile-card-value"
                                                                style={{ color: "var(--color-danger-text)" }}
                                                            >
                                                                {item.quantidade} / {item.estoque_minimo}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        <div>
                            <h2 className={styles.section_title}>Movimentações Recentes</h2>
                            <div className="table-container">
                                {movimentacoesRecentes.length === 0 ? (
                                    <div className="empty-state">Nenhuma movimentação registrada.</div>
                                ) : (
                                    <>
                                        <table className="data-table hidden-mobile">
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
                                                                variant={
                                                                    mov.tipo === "entrada" ? "success" : "critical"
                                                                }
                                                            >
                                                                {mov.tipo}
                                                            </Badge>
                                                        </td>
                                                        <td className="fw500">
                                                            {mov.produtos?.nome || "Desconhecido"}
                                                        </td>
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

                                        <div className="mobile-cards-list mobile-only">
                                            {movimentacoesRecentes.map((mov) => (
                                                <div key={mov.id} className="mobile-card">
                                                    <div className="mobile-card-header">
                                                        <div className="mobile-card-title">
                                                            {mov.produtos?.nome || "Desconhecido"}
                                                        </div>
                                                        <Badge
                                                            variant={mov.tipo === "entrada" ? "success" : "critical"}
                                                        >
                                                            {mov.tipo}
                                                        </Badge>
                                                    </div>
                                                    <div className="mobile-card-body">
                                                        <div className="mobile-card-row">
                                                            <span className="mobile-card-label">Data</span>
                                                            <span className="mobile-card-value">
                                                                {formatDate(mov.criada_em).split(" ")[0]}
                                                            </span>
                                                        </div>
                                                        <div className="mobile-card-row">
                                                            <span className="mobile-card-label">Quantidade</span>
                                                            <span
                                                                className={`mobile-card-value ${mov.tipo === "entrada" ? styles.text_success : styles.text_danger}`}
                                                            >
                                                                {mov.tipo === "entrada" ? "+" : "-"}
                                                                {mov.quantidade}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </div>
    );
}
