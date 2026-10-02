import {
    AlertTriangle,
    ArrowDownRight,
    ArrowRight,
    ArrowUpRight,
    DollarSign,
    Package,
    ShoppingCart,
} from "lucide-react";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import { Badge } from "../../components/ui/Badge";
import { Card } from "../../components/ui/Card";
import { PageHeader } from "../../components/ui/PageHeader";
import { useDashboard } from "../../hooks/useDashboard";
import { formatCurrency, formatDate } from "../../utils/formatters";
import styles from "./styles.module.css";

export function Dashboard() {
    const navigate = useNavigate();
    const { loading, metricas, itensCriticos, movimentacoesRecentes, resumoFluxo, userName } = useDashboard();

    return (
        <div className="page-container">
            <PageHeader
                title={`Olá, ${userName || "Usuário"}!`}
                subtitle="Visão operacional do inventário, alertas de reposição e movimentações recentes."
            />

            {loading ? (
                <div className="loading-state">Carregando métricas operacionais...</div>
            ) : (
                <>
                    {metricas.estoqueCritico > 0 && (
                        <motion.div
                            className={styles.alert_banner}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className={styles.alert_banner_content}>
                                <AlertTriangle size={20} className={styles.alert_banner_icon} />
                                <span>
                                    <strong>Atenção operacional:</strong> Existem{" "}
                                    <strong>{metricas.estoqueCritico}</strong> produto(s) abaixo do estoque mínimo
                                    definido. Reposição necessária para evitar ruptura.
                                </span>
                            </div>
                            <Badge variant="critical">Ação necessária</Badge>
                        </motion.div>
                    )}

                    <motion.div
                        className={styles.metrics_grid}
                        initial="hidden"
                        animate="visible"
                        variants={{
                            hidden: { opacity: 0 },
                            visible: {
                                opacity: 1,
                                transition: { staggerChildren: 0.08 },
                            },
                        }}
                    >
                        <motion.div variants={{ hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0 } }}>
                            <Card className={styles.metric_card} padding="medium">
                                <div className={styles.metric_header}>
                                    <h3>Valor Total do Estoque</h3>
                                    <DollarSign size={18} className={styles.metric_icon_neutral} />
                                </div>
                                <div className={styles.metric_value}>{formatCurrency(metricas.valorTotal)}</div>
                            </Card>
                        </motion.div>

                        <motion.div variants={{ hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0 } }}>
                            <Card className={styles.metric_card} padding="medium">
                                <div className={styles.metric_header}>
                                    <h3>Total de Produtos</h3>
                                    <Package size={18} className={styles.metric_icon_neutral} />
                                </div>
                                <div className={styles.metric_value}>{metricas.totalProdutos}</div>
                            </Card>
                        </motion.div>

                        <motion.div variants={{ hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0 } }}>
                            <Card className={styles.metric_card} padding="medium">
                                <div className={styles.metric_header}>
                                    <h3>Estoque Crítico</h3>
                                    <AlertTriangle
                                        size={18}
                                        className={
                                            metricas.estoqueCritico > 0
                                                ? styles.metric_icon_danger
                                                : styles.metric_icon_neutral
                                        }
                                    />
                                </div>
                                <div
                                    className={styles.metric_value}
                                    style={{
                                        color:
                                            metricas.estoqueCritico > 0
                                                ? "var(--color-danger-text)"
                                                : "var(--color-text-primary)",
                                    }}
                                >
                                    {metricas.estoqueCritico}
                                </div>
                            </Card>
                        </motion.div>

                        <motion.div variants={{ hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0 } }}>
                            <Card className={styles.metric_card} padding="medium">
                                <div className={styles.metric_header}>
                                    <h3>Pedidos em Aberto</h3>
                                    <ShoppingCart size={18} className={styles.metric_icon_neutral} />
                                </div>
                                <div className={styles.metric_value}>{metricas.pedidosAbertos}</div>
                            </Card>
                        </motion.div>
                    </motion.div>

                    <div className={styles.critical_section}>
                        <div className={styles.section_header}>
                            <div className={styles.section_title_group}>
                                <h2 className={styles.section_title}>Produtos em Nível Crítico</h2>
                                <p className={styles.section_subtitle}>
                                    Itens que exigem reposição imediata para evitar desabastecimento
                                </p>
                            </div>
                            {itensCriticos.length > 0 && (
                                <Badge variant="critical">
                                    {itensCriticos.length}{" "}
                                    {itensCriticos.length === 1 ? "item crítico" : "itens críticos"}
                                </Badge>
                            )}
                        </div>

                        <div className="table-container">
                            {itensCriticos.length === 0 ? (
                                <div className="empty-state">
                                    Estoque saudável. Nenhum produto abaixo do nível mínimo.
                                </div>
                            ) : (
                                <>
                                    <table className="data-table hidden-mobile">
                                        <thead>
                                            <tr>
                                                <th>Produto / SKU</th>
                                                <th className="text-right">Estoque / Mínimo</th>
                                                <th className="text-center">Déficit</th>
                                                <th className="text-right">Ação</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {itensCriticos.map((item) => {
                                                const deficit = Math.max(
                                                    (item.estoque_minimo || 0) - (item.quantidade || 0),
                                                    0,
                                                );
                                                return (
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
                                                            <span className={styles.deficit_text}>-{deficit} un</span>
                                                        </td>
                                                        <td className="text-right">
                                                            <button
                                                                type="button"
                                                                className={styles.repor_btn}
                                                                onClick={() =>
                                                                    navigate("/movimentacoes", {
                                                                        state: {
                                                                            preselectedProdutoId: item.id,
                                                                            abrirModal: true,
                                                                        },
                                                                    })
                                                                }
                                                            >
                                                                <ArrowUpRight size={14} />
                                                                Repor
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>

                                    <div className="mobile-cards-list mobile-only">
                                        {itensCriticos.map((item) => {
                                            const deficit = Math.max(
                                                (item.estoque_minimo || 0) - (item.quantidade || 0),
                                                0,
                                            );
                                            return (
                                                <div key={item.id} className="mobile-card">
                                                    <div className="mobile-card-header">
                                                        <div>
                                                            <div className="mobile-card-title">{item.nome}</div>
                                                            <div className="mobile-card-subtitle">{item.sku}</div>
                                                        </div>
                                                        <span className={styles.deficit_text}>
                                                            Déficit: -{deficit} un
                                                        </span>
                                                    </div>
                                                    <div className="mobile-card-body">
                                                        <div className="mobile-card-row">
                                                            <span className="mobile-card-label">
                                                                Estoque Atual / Mínimo
                                                            </span>
                                                            <span className="mobile-card-value">
                                                                {item.quantidade} / {item.estoque_minimo}
                                                            </span>
                                                        </div>
                                                        <div className="mobile-card-row" style={{ marginTop: 8 }}>
                                                            <button
                                                                type="button"
                                                                className={styles.repor_btn}
                                                                style={{ width: "100%", justifyContent: "center" }}
                                                                onClick={() =>
                                                                    navigate("/movimentacoes", {
                                                                        state: {
                                                                            preselectedProdutoId: item.id,
                                                                            abrirModal: true,
                                                                        },
                                                                    })
                                                                }
                                                            >
                                                                <ArrowUpRight size={14} />
                                                                Repor no Estoque
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    <div className={styles.operational_grid}>
                        <div>
                            <div className={styles.section_header}>
                                <div className={styles.section_title_group}>
                                    <h2 className={styles.section_title}>Movimentações Recentes</h2>
                                    <p className={styles.section_subtitle}>
                                        Últimos 5 registros de entrada e saída com responsável
                                    </p>
                                </div>
                            </div>

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
                                                    <th>Responsável</th>
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
                                                                {mov.tipo === "entrada" ? "Entrada" : "Saída"}
                                                            </Badge>
                                                        </td>
                                                        <td>
                                                            <div className="fw500">
                                                                {mov.produtos?.nome || "Desconhecido"}
                                                            </div>
                                                            <div className="text-monospace">{mov.produtos?.sku}</div>
                                                        </td>
                                                        <td
                                                            className={`${
                                                                mov.tipo === "entrada"
                                                                    ? styles.text_success
                                                                    : styles.text_danger
                                                            } text-right fw600`}
                                                        >
                                                            {mov.tipo === "entrada" ? "+" : "-"}
                                                            {mov.quantidade}
                                                        </td>
                                                        <td>{mov.usuarios?.nome || "Não identificado"}</td>
                                                        <td className="text-secondary">{formatDate(mov.criada_em)}</td>
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
                                                            {mov.tipo === "entrada" ? "Entrada" : "Saída"}
                                                        </Badge>
                                                    </div>
                                                    <div className="mobile-card-body">
                                                        <div className="mobile-card-row">
                                                            <span className="mobile-card-label">Quantidade</span>
                                                            <span
                                                                className={`mobile-card-value ${
                                                                    mov.tipo === "entrada"
                                                                        ? styles.text_success
                                                                        : styles.text_danger
                                                                }`}
                                                            >
                                                                {mov.tipo === "entrada" ? "+" : "-"}
                                                                {mov.quantidade}
                                                            </span>
                                                        </div>
                                                        <div className="mobile-card-row">
                                                            <span className="mobile-card-label">Responsável</span>
                                                            <span className="mobile-card-value">
                                                                {mov.usuarios?.nome || "Não identificado"}
                                                            </span>
                                                        </div>
                                                        <div className="mobile-card-row">
                                                            <span className="mobile-card-label">Data</span>
                                                            <span className="mobile-card-value">
                                                                {formatDate(mov.criada_em)}
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
                            <div className={styles.section_header}>
                                <div className={styles.section_title_group}>
                                    <h2 className={styles.section_title}>Fluxo dos Últimos 14 Dias</h2>
                                    <p className={styles.section_subtitle}>Resumo consolidado do período</p>
                                </div>
                            </div>

                            <Card className={styles.fluxo_card} padding="medium">
                                <div className={styles.fluxo_stats_list}>
                                    <div className={styles.fluxo_stat_item}>
                                        <div className={styles.fluxo_stat_label}>
                                            <ArrowUpRight size={16} className={styles.text_success} />
                                            <span>Total de Entradas</span>
                                        </div>
                                        <div className={`${styles.fluxo_stat_value} ${styles.text_success}`}>
                                            +{resumoFluxo.totalEntradas} un
                                        </div>
                                    </div>

                                    <div className={styles.fluxo_stat_item}>
                                        <div className={styles.fluxo_stat_label}>
                                            <ArrowDownRight size={16} className={styles.text_danger} />
                                            <span>Total de Saídas</span>
                                        </div>
                                        <div className={`${styles.fluxo_stat_value} ${styles.text_danger}`}>
                                            -{resumoFluxo.totalSaidas} un
                                        </div>
                                    </div>

                                    <div className={styles.fluxo_stat_item}>
                                        <div className={styles.fluxo_stat_label}>
                                            <span>Saldo Líquido</span>
                                        </div>
                                        <div
                                            className={styles.fluxo_stat_value}
                                            style={{
                                                color:
                                                    resumoFluxo.saldoLiquido >= 0
                                                        ? "var(--color-success-text)"
                                                        : "var(--color-danger-text)",
                                            }}
                                        >
                                            {resumoFluxo.saldoLiquido > 0 ? "+" : ""}
                                            {resumoFluxo.saldoLiquido} un
                                        </div>
                                    </div>
                                </div>

                                <div className={styles.fluxo_action_box}>
                                    <button
                                        type="button"
                                        className={styles.analises_link_btn}
                                        onClick={() => navigate("/analises")}
                                    >
                                        <span>Ver gráficos e análises completos</span>
                                        <ArrowRight size={15} />
                                    </button>
                                </div>
                            </Card>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
