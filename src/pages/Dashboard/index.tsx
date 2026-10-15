import { ArrowDownRight, ArrowRight, ArrowUpRight, Plus, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { EmptyState } from "../../components/ui/EmptyState";
import { PageHeader } from "../../components/ui/PageHeader";
import { Skeleton } from "../../components/ui/Skeleton";
import { useDashboard } from "../../hooks/useDashboard";
import { formatCurrency, formatDate } from "../../utils/formatters";

export function Dashboard() {
    const navigate = useNavigate();
    const { loading, metricas, itensCriticos, movimentacoesRecentes, userName } = useDashboard();

    return (
        <div className="space-y-6">
            <PageHeader
                title={userName ? `Olá, ${userName}` : "Dashboard"}
                subtitle="Visão geral e monitoramento operacional do estoque."
            >
                <Button onClick={() => navigate("/movimentacoes", { state: { abrirModal: true } })} variant="primary">
                    <Plus size={16} />
                    <span>Nova Movimentação</span>
                </Button>
            </PageHeader>

            {loading ? (
                <div className="space-y-6">
                    <div className="rounded-lg border border-slate-200 bg-white p-5">
                        <div className="grid grid-cols-1 divide-y divide-slate-100 sm:grid-cols-2 sm:divide-y-0 sm:divide-x lg:grid-cols-4">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="p-4 space-y-2">
                                    <Skeleton className="w-24 h-3.5" />
                                    <Skeleton className="w-32 h-7" />
                                    <Skeleton className="w-20 h-3" />
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white p-6 space-y-4">
                        <Skeleton className="w-48 h-5" />
                        <Skeleton className="w-full h-8" />
                        <Skeleton className="w-full h-8" />
                    </div>
                </div>
            ) : (
                <>
                    <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
                        <div className="grid grid-cols-1 divide-y divide-slate-200 sm:grid-cols-2 sm:divide-y-0 sm:divide-x lg:grid-cols-4">
                            <div className="p-5">
                                <span className="text-xs font-medium text-slate-500">Valor Total em Estoque</span>
                                <div className="mt-1 text-2xl font-semibold tracking-tight text-slate-900 tabular-nums">
                                    {formatCurrency(metricas.valorTotal)}
                                </div>
                                <p className="mt-1 text-xs text-slate-400">Patrimônio físico avaliado</p>
                            </div>

                            <div className="p-5">
                                <span className="text-xs font-medium text-slate-500">Total de Produtos</span>
                                <div className="mt-1 text-2xl font-semibold tracking-tight text-slate-900 tabular-nums">
                                    {metricas.totalProdutos}
                                </div>
                                <p className="mt-1 text-xs text-slate-400">SKUs ativos no catálogo</p>
                            </div>

                            <div className="p-5">
                                <span className="text-xs font-medium text-slate-500">Itens com Estoque Baixo</span>
                                <div className="mt-1 flex items-baseline gap-2">
                                    <span
                                        className={`text-2xl font-semibold tracking-tight tabular-nums ${
                                            metricas.estoqueCritico > 0 ? "text-amber-600" : "text-slate-900"
                                        }`}
                                    >
                                        {metricas.estoqueCritico}
                                    </span>
                                    {metricas.estoqueCritico > 0 && (
                                        <span className="text-xs font-medium text-amber-600 flex items-center gap-1">
                                            Abaixo do mínimo
                                        </span>
                                    )}
                                </div>
                                <p className="mt-1 text-xs text-slate-400">
                                    {metricas.estoqueCritico > 0
                                        ? "Necessitam de reposição"
                                        : "Nenhum déficit registrado"}
                                </p>
                            </div>

                            <div className="p-5">
                                <span className="text-xs font-medium text-slate-500">Pedidos de Compra Abertos</span>
                                <div className="mt-1 text-2xl font-semibold tracking-tight text-slate-900 tabular-nums">
                                    {metricas.pedidosAbertos}
                                </div>
                                <p className="mt-1 text-xs text-slate-400">Aguardando recebimento</p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
                        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
                            <div>
                                <h2 className="text-sm font-semibold text-slate-900">
                                    Produtos que Precisam de Reposição
                                </h2>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Itens com saldo físico igual ou inferior ao estoque mínimo configurado.
                                </p>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigate("/produtos")}
                                className="text-slate-600 hover:text-slate-900"
                            >
                                <span>Ver produtos</span>
                                <ArrowRight size={15} />
                            </Button>
                        </div>

                        {itensCriticos.length === 0 ? (
                            <EmptyState
                                icon={ShieldCheck}
                                title="Estoque regularizado"
                                description="Todos os produtos cadastrados estão com saldo igual ou acima do nível mínimo de segurança."
                                className="border-0 py-10"
                            />
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs border-collapse">
                                    <thead>
                                        <tr className="border-b border-slate-200 bg-slate-50/50 text-slate-600 font-medium">
                                            <th className="px-5 py-2.5">Status</th>
                                            <th className="px-5 py-2.5">Produto</th>
                                            <th className="px-5 py-2.5">SKU</th>
                                            <th className="px-5 py-2.5 text-right">Estoque Atual</th>
                                            <th className="px-5 py-2.5 text-right">Mínimo</th>
                                            <th className="px-5 py-2.5 text-right">Déficit</th>
                                            <th className="px-5 py-2.5 text-right">Ação</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {itensCriticos.map((item) => {
                                            const deficit = Math.max(
                                                (item.estoque_minimo || 0) - (item.quantidade || 0),
                                                0,
                                            );
                                            const isZerado = (item.quantidade || 0) === 0;

                                            return (
                                                <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                                                    <td className="px-5 py-3">
                                                        <Badge variant={isZerado ? "critical" : "warning"}>
                                                            {isZerado ? "Zerado" : "Crítico"}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-5 py-3 font-medium text-slate-900">
                                                        {item.nome}
                                                    </td>
                                                    <td className="px-5 py-3 font-mono text-slate-500">{item.sku}</td>
                                                    <td className="px-5 py-3 text-right font-semibold text-red-600 tabular-nums">
                                                        {item.quantidade} un
                                                    </td>
                                                    <td className="px-5 py-3 text-right text-slate-500 tabular-nums">
                                                        {item.estoque_minimo} un
                                                    </td>
                                                    <td className="px-5 py-3 text-right font-medium text-red-600 tabular-nums">
                                                        -{deficit} un
                                                    </td>
                                                    <td className="px-5 py-3 text-right">
                                                        <Button
                                                            size="sm"
                                                            variant="secondary"
                                                            onClick={() =>
                                                                navigate("/movimentacoes", {
                                                                    state: {
                                                                        preselectedProdutoId: item.id,
                                                                        abrirModal: true,
                                                                    },
                                                                })
                                                            }
                                                        >
                                                            Repor
                                                        </Button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
                        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
                            <div>
                                <h2 className="text-sm font-semibold text-slate-900">Últimas Movimentações</h2>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Registros recentes de entrada e saída no almoxarifado.
                                </p>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigate("/movimentacoes")}
                                className="text-slate-600 hover:text-slate-900"
                            >
                                <span>Ver todas</span>
                                <ArrowRight size={15} />
                            </Button>
                        </div>

                        {movimentacoesRecentes.length === 0 ? (
                            <EmptyState
                                icon={ShieldCheck}
                                title="Nenhuma movimentação registrada"
                                description="Quando houver entradas ou saídas de mercadorias, o histórico recente será exibido aqui."
                                className="border-0 py-10"
                            />
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs border-collapse">
                                    <thead>
                                        <tr className="border-b border-slate-200 bg-slate-50/50 text-slate-600 font-medium">
                                            <th className="px-5 py-2.5">Tipo</th>
                                            <th className="px-5 py-2.5">Produto</th>
                                            <th className="px-5 py-2.5">SKU</th>
                                            <th className="px-5 py-2.5">Responsável</th>
                                            <th className="px-5 py-2.5">Data</th>
                                            <th className="px-5 py-2.5 text-right">Quantidade</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {movimentacoesRecentes.map((mov) => {
                                            const isEntrada = mov.tipo === "entrada";
                                            return (
                                                <tr key={mov.id} className="hover:bg-slate-50/60 transition-colors">
                                                    <td className="px-5 py-3">
                                                        <span
                                                            className={`inline-flex items-center gap-1 font-medium ${
                                                                isEntrada ? "text-emerald-700" : "text-slate-700"
                                                            }`}
                                                        >
                                                            {isEntrada ? (
                                                                <ArrowDownRight
                                                                    size={16}
                                                                    className="text-emerald-600"
                                                                />
                                                            ) : (
                                                                <ArrowUpRight size={16} className="text-slate-500" />
                                                            )}
                                                            {isEntrada ? "Entrada" : "Saída"}
                                                        </span>
                                                    </td>
                                                    <td className="px-5 py-3 font-medium text-slate-900">
                                                        {mov.produtos?.nome || "Produto não identificado"}
                                                    </td>
                                                    <td className="px-5 py-3 font-mono text-slate-500">
                                                        {mov.produtos?.sku}
                                                    </td>
                                                    <td className="px-5 py-3 text-slate-600">
                                                        {mov.usuarios?.nome || "Responsável"}
                                                    </td>
                                                    <td className="px-5 py-3 text-slate-500">
                                                        {formatDate(mov.criada_em)}
                                                    </td>
                                                    <td
                                                        className={`px-5 py-3 text-right font-semibold tabular-nums ${
                                                            isEntrada ? "text-emerald-700" : "text-slate-900"
                                                        }`}
                                                    >
                                                        {isEntrada ? "+" : "-"}
                                                        {mov.quantidade} un
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
