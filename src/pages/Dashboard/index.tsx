import { AlertTriangle, ArrowUpRight, DollarSign, Package, ShoppingCart } from "lucide-react";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import {
    CartesianGrid,
    Cell,
    Line,
    LineChart,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import { Badge } from "../../components/ui/Badge";
import { Card } from "../../components/ui/Card";
import { PageHeader } from "../../components/ui/PageHeader";
import { useDashboard } from "../../hooks/useDashboard";
import { formatCurrency, formatDate } from "../../utils/formatters";
import styles from "./styles.module.css";

const DONUT_COLORS = [
    "#0d9488",
    "#2563eb",
    "#7c3aed",
    "#db2777",
    "#d97706",
    "#059669",
    "#4f46e5",
    "#64748b",
];

interface TooltipPayloadItem {
    name: string;
    value: number;
    dataKey: string;
    payload: {
        categoria?: string;
        valorTotal?: number;
        quantidadeItens?: number;
        percentual?: number;
    };
}

interface CustomTooltipProps {
    active?: boolean;
    payload?: TooltipPayloadItem[];
    label?: string;
}

function CustomFluxoTooltip({ active, payload, label }: CustomTooltipProps) {
    if (active && payload && payload.length) {
        return (
            <div className={styles.chart_tooltip}>
                <div className={styles.chart_tooltip_label}>Dia {label}</div>
                {payload.map((entry) => (
                    <div key={entry.name} className={styles.chart_tooltip_row}>
                        <span className={entry.dataKey === "entradas" ? styles.dot_entradas : styles.dot_saidas} />
                        <span>
                            {entry.name}: <strong>{entry.value} un</strong>
                        </span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
}

function CustomDonutTooltip({ active, payload }: CustomTooltipProps) {
    if (active && payload && payload.length) {
        const item = payload[0].payload;
        return (
            <div className={styles.chart_tooltip}>
                <div className={styles.chart_tooltip_label}>{item.categoria}</div>
                <div className={styles.chart_tooltip_row}>
                    <span>
                        Valor estimado: <strong>{formatCurrency(item.valorTotal || 0)}</strong>
                    </span>
                </div>
                <div className={styles.chart_tooltip_row}>
                    <span>
                        Participação: <strong>{item.percentual}%</strong>
                    </span>
                </div>
                <div className={styles.chart_tooltip_row}>
                    <span>
                        Itens em estoque: <strong>{item.quantidadeItens} un</strong>
                    </span>
                </div>
            </div>
        );
    }
    return null;
}

export function Dashboard() {
    const navigate = useNavigate();
    const {
        loading,
        metricas,
        itensCriticos,
        movimentacoesRecentes,
        userName,
        fluxoMovimentacoes,
        temMovimentacoesNoPeriodo,
        distribuicaoCategorias,
    } = useDashboard();

    const categoriasComValor = distribuicaoCategorias.filter((c) => c.valorTotal > 0);
    const valorTotalCategorias = categoriasComValor.reduce((acc, curr) => acc + curr.valorTotal, 0);

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
                        className={styles.charts_grid}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35, delay: 0.15 }}
                    >
                        <Card className={styles.chart_card} padding="medium">
                            <div className={styles.chart_header}>
                                <h3 className={styles.chart_title}>Fluxo de Movimentações</h3>
                                <p className={styles.chart_subtitle}>
                                    Volume de entradas e saídas nos últimos 14 dias (Fuso: Brasília)
                                </p>
                                <div className={styles.chart_legend}>
                                    <div className={styles.chart_legend_item}>
                                        <span className={styles.dot_entradas} />
                                        <span>Entradas</span>
                                    </div>
                                    <div className={styles.chart_legend_item}>
                                        <span className={styles.dot_saidas} />
                                        <span>Saídas</span>
                                    </div>
                                </div>
                            </div>

                            {!temMovimentacoesNoPeriodo ? (
                                <div className={styles.chart_empty}>
                                    Nenhuma movimentação registrada nos últimos 14 dias.
                                </div>
                            ) : (
                                <ResponsiveContainer width="100%" height={260}>
                                    <LineChart
                                        data={fluxoMovimentacoes}
                                        margin={{ top: 10, right: 15, left: -20, bottom: 0 }}
                                    >
                                        <CartesianGrid
                                            strokeDasharray="3 3"
                                            stroke="var(--color-border)"
                                            vertical={false}
                                        />
                                        <XAxis
                                            dataKey="diaMes"
                                            stroke="var(--color-text-muted)"
                                            fontSize={12}
                                            tickLine={false}
                                            axisLine={false}
                                        />
                                        <YAxis
                                            stroke="var(--color-text-muted)"
                                            fontSize={12}
                                            tickLine={false}
                                            axisLine={false}
                                            allowDecimals={false}
                                        />
                                        <Tooltip content={<CustomFluxoTooltip />} />
                                        <Line
                                            type="monotone"
                                            dataKey="entradas"
                                            name="Entradas"
                                            stroke="var(--color-success-text)"
                                            strokeWidth={2.5}
                                            dot={{ r: 3, fill: "var(--color-success-text)" }}
                                            activeDot={{ r: 5 }}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="saidas"
                                            name="Saídas"
                                            stroke="var(--color-danger-text)"
                                            strokeWidth={2.5}
                                            dot={{ r: 3, fill: "var(--color-danger-text)" }}
                                            activeDot={{ r: 5 }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            )}
                        </Card>

                        <Card className={styles.chart_card} padding="medium">
                            <div className={styles.chart_header}>
                                <h3 className={styles.chart_title}>Valor estimado do estoque por categoria</h3>
                                <p className={styles.chart_subtitle}>
                                    Calculado a partir de quantidade × preço atual de cadastro
                                </p>
                            </div>

                            {categoriasComValor.length === 0 || valorTotalCategorias === 0 ? (
                                <div className={styles.chart_empty}>
                                    Nenhuma categoria com valor estimado em estoque.
                                </div>
                            ) : (
                                <div className={styles.donut_layout}>
                                    <div className={styles.donut_chart_wrapper}>
                                        <ResponsiveContainer width="100%" height={240}>
                                            <PieChart>
                                                <Pie
                                                    data={categoriasComValor}
                                                    dataKey="valorTotal"
                                                    nameKey="categoria"
                                                    innerRadius={55}
                                                    outerRadius={85}
                                                    paddingAngle={3}
                                                    cornerRadius={3}
                                                >
                                                    {categoriasComValor.map((entry, index) => (
                                                        <Cell
                                                            key={`cell-${entry.categoria}`}
                                                            fill={DONUT_COLORS[index % DONUT_COLORS.length]}
                                                        />
                                                    ))}
                                                </Pie>
                                                <Tooltip content={<CustomDonutTooltip />} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className={styles.donut_legend_list}>
                                        {categoriasComValor.map((cat, idx) => (
                                            <div key={cat.categoria} className={styles.donut_legend_row}>
                                                <div className={styles.donut_legend_left}>
                                                    <span
                                                        className={styles.donut_legend_dot}
                                                        style={{
                                                            backgroundColor:
                                                                DONUT_COLORS[idx % DONUT_COLORS.length],
                                                        }}
                                                    />
                                                    <span className={styles.donut_legend_name} title={cat.categoria}>
                                                        {cat.categoria}
                                                    </span>
                                                </div>
                                                <div className={styles.donut_legend_right}>
                                                    <span className={styles.donut_legend_percent}>
                                                        {cat.percentual}%
                                                    </span>
                                                    <span className={styles.donut_legend_value}>
                                                        {formatCurrency(cat.valorTotal)}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </Card>
                    </motion.div>

                    <motion.div
                        className={styles.tables_grid}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.2 }}
                    >
                        <div>
                            <div className={styles.chart_header}>
                                <h2 className={styles.section_title} style={{ marginBottom: 4 }}>
                                    Itens em Nível Crítico
                                </h2>
                                <p className={styles.chart_subtitle} style={{ marginBottom: 16 }}>
                                    Produtos com saldo igual ou abaixo do estoque mínimo
                                </p>
                            </div>
                            <div className="table-container">
                                {itensCriticos.length === 0 ? (
                                    <div className="empty-state">
                                        Estoque regular. Nenhum produto abaixo do nível mínimo.
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
                                                                <span className={styles.deficit_text}>
                                                                    -{deficit} un
                                                                </span>
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

                        <div>
                            <div className={styles.chart_header}>
                                <h2 className={styles.section_title} style={{ marginBottom: 4 }}>
                                    Movimentações Recentes
                                </h2>
                                <p className={styles.chart_subtitle} style={{ marginBottom: 16 }}>
                                    Últimos registros de entrada e saída com responsável
                                </p>
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
                                                            <div className="text-monospace">
                                                                {mov.produtos?.sku}
                                                            </div>
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
                                                        <td>
                                                            {mov.usuarios?.nome || "Não identificado"}
                                                        </td>
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
                                                            variant={
                                                                mov.tipo === "entrada" ? "success" : "critical"
                                                            }
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
                    </motion.div>
                </>
            )}
        </div>
    );
}
