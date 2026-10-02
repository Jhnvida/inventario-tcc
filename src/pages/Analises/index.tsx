import { Activity, ArrowDownRight, ArrowUpRight, PieChart as PieIcon } from "lucide-react";
import { motion } from "motion/react";
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
import { Card } from "../../components/ui/Card";
import { PageHeader } from "../../components/ui/PageHeader";
import { useAnalises } from "../../hooks/useAnalises";
import { formatCurrency } from "../../utils/formatters";
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

export function Analises() {
    const { loading, fluxoMovimentacoes, temMovimentacoesNoPeriodo, distribuicaoCategorias, metricasAnaliticas } =
        useAnalises();

    const categoriasComValor = distribuicaoCategorias.filter((c) => c.valorTotal > 0);
    const valorTotalCategorias = categoriasComValor.reduce((acc, curr) => acc + curr.valorTotal, 0);

    return (
        <div className="page-container">
            <PageHeader
                title="Análises de Estoque"
                subtitle="Visão analítica de movimentação diária e capital alocado no inventário."
            />

            {loading ? (
                <div className="loading-state">Carregando análises do estoque...</div>
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
                        <motion.div variants={{ hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0 } }}>
                            <Card className={styles.metric_card} padding="medium">
                                <div className={styles.metric_header}>
                                    <h3>Volume Movimentado (14 dias)</h3>
                                    <Activity size={18} className={styles.metric_icon} />
                                </div>
                                <div className={styles.metric_value}>{metricasAnaliticas.volumeTotal} un</div>
                                <div className={styles.metric_hint}>Soma de entradas e saídas físicas</div>
                            </Card>
                        </motion.div>

                        <motion.div variants={{ hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0 } }}>
                            <Card className={styles.metric_card} padding="medium">
                                <div className={styles.metric_header}>
                                    <h3>Saldo Líquido (14 dias)</h3>
                                    {metricasAnaliticas.saldoLiquido >= 0 ? (
                                        <ArrowUpRight size={18} style={{ color: "var(--color-success-text)" }} />
                                    ) : (
                                        <ArrowDownRight size={18} style={{ color: "var(--color-danger-text)" }} />
                                    )}
                                </div>
                                <div
                                    className={styles.metric_value}
                                    style={{
                                        color:
                                            metricasAnaliticas.saldoLiquido >= 0
                                                ? "var(--color-success-text)"
                                                : "var(--color-danger-text)",
                                    }}
                                >
                                    {metricasAnaliticas.saldoLiquido > 0 ? "+" : ""}
                                    {metricasAnaliticas.saldoLiquido} un
                                </div>
                                <div className={styles.metric_hint}>Entradas subtraídas das saídas</div>
                            </Card>
                        </motion.div>

                        <motion.div variants={{ hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0 } }}>
                            <Card className={styles.metric_card} padding="medium">
                                <div className={styles.metric_header}>
                                    <h3>Maior Capital Alocado</h3>
                                    <PieIcon size={18} className={styles.metric_icon} />
                                </div>
                                <div
                                    className={styles.metric_value}
                                    style={{
                                        fontSize: 20,
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        whiteSpace: "nowrap",
                                    }}
                                    title={metricasAnaliticas.topCategoria}
                                >
                                    {metricasAnaliticas.topCategoria}
                                </div>
                                <div className={styles.metric_hint}>
                                    {metricasAnaliticas.totalCategoriasAtivas} categorias com estoque ativo
                                </div>
                            </Card>
                        </motion.div>
                    </motion.div>

                    <div className={styles.charts_stack}>
                        <Card className={styles.chart_card} padding="medium">
                            <div className={styles.chart_header}>
                                <h3 className={styles.chart_title}>Fluxo de Movimentações</h3>
                                <p className={styles.chart_subtitle}>
                                    Volume de entradas e saídas nos últimos 14 dias (Fuso operacional: Brasília)
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
                                <ResponsiveContainer width="100%" height={280}>
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
                                        <ResponsiveContainer width="100%" height={260}>
                                            <PieChart>
                                                <Pie
                                                    data={categoriasComValor}
                                                    dataKey="valorTotal"
                                                    nameKey="categoria"
                                                    innerRadius={60}
                                                    outerRadius={95}
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
                                                            backgroundColor: DONUT_COLORS[idx % DONUT_COLORS.length],
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
                    </div>
                </>
            )}
        </div>
    );
}
