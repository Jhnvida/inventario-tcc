import { ArrowDownRight, ArrowLeftRight, ArrowRight, ArrowUpRight, Plus, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "../../components/ui/Badge";
import { Button, IconButton } from "../../components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription } from "../../components/ui/Card";
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
                    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-2xs">
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
                    <div className="rounded-lg border border-slate-200 bg-white p-6 space-y-4 shadow-2xs">
                        <Skeleton className="w-48 h-5" />
                        <Skeleton className="w-full h-8" />
                        <Skeleton className="w-full h-8" />
                    </div>
                </div>
            ) : (
                <>
                    <Card padding="none" className="overflow-hidden">
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
                                        <Badge variant="warning" dot>
                                            Abaixo do mínimo
                                        </Badge>
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
                    </Card>

                    <Card padding="none" className="overflow-hidden">
                        <CardHeader
                            action={
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => navigate("/produtos")}
                                    className="text-slate-600 hover:text-slate-900"
                                >
                                    <span>Ver catálogo</span>
                                    <ArrowRight size={14} />
                                </Button>
                            }
                        >
                            <CardTitle>Produtos que Precisam de Reposição</CardTitle>
                            <CardDescription>
                                Itens com saldo físico igual ou inferior ao estoque mínimo configurado.
                            </CardDescription>
                        </CardHeader>

                        {itensCriticos.length === 0 ? (
                            <EmptyState
                                icon={ShieldCheck}
                                title="Estoque regularizado"
                                description="Todos os produtos cadastrados estão com saldo igual ou acima do nível mínimo de segurança."
                                border="none"
                                className="py-10"
                            />
                        ) : (
                            <>
                                <div className="hidden md:block overflow-x-auto">
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
                                                    <tr
                                                        key={item.id}
                                                        className="hover:bg-slate-50/75 transition-colors duration-150 ease-out"
                                                    >
                                                        <td className="px-5 py-3">
                                                            <Badge variant={isZerado ? "critical" : "warning"} dot>
                                                                {isZerado ? "Zerado" : "Crítico"}
                                                            </Badge>
                                                        </td>
                                                        <td className="px-5 py-3 font-medium text-slate-900">
                                                            {item.nome}
                                                        </td>
                                                        <td className="px-5 py-3 font-mono text-slate-500">
                                                            {item.sku}
                                                        </td>
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
                                                            <div className="flex items-center justify-end">
                                                                <IconButton
                                                                    title="Repor estoque via movimentação"
                                                                    aria-label={`Repor estoque do produto ${item.nome}`}
                                                                    onClick={() =>
                                                                        navigate("/movimentacoes", {
                                                                            state: {
                                                                                preselectedProdutoId: item.id,
                                                                                abrirModal: true,
                                                                            },
                                                                        })
                                                                    }
                                                                >
                                                                    <ArrowLeftRight size={15} />
                                                                </IconButton>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="md:hidden divide-y divide-slate-100">
                                    {itensCriticos.map((item) => {
                                        const deficit = Math.max(
                                            (item.estoque_minimo || 0) - (item.quantidade || 0),
                                            0,
                                        );
                                        const isZerado = (item.quantidade || 0) === 0;

                                        return (
                                            <div key={item.id} className="p-4 space-y-2.5">
                                                <div className="flex items-start justify-between gap-2">
                                                    <div>
                                                        <h4 className="font-medium text-slate-900 text-sm">
                                                            {item.nome}
                                                        </h4>
                                                        <span className="font-mono text-xs text-slate-500">
                                                            {item.sku}
                                                        </span>
                                                    </div>
                                                    <Badge variant={isZerado ? "critical" : "warning"} dot>
                                                        {isZerado ? "Zerado" : "Crítico"}
                                                    </Badge>
                                                </div>

                                                <div className="grid grid-cols-3 gap-2 text-xs bg-slate-50 p-2.5 rounded-md">
                                                    <div>
                                                        <span className="text-slate-400 block">Atual</span>
                                                        <span className="font-semibold text-red-600 tabular-nums">
                                                            {item.quantidade} un
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <span className="text-slate-400 block">Mínimo</span>
                                                        <span className="font-medium text-slate-700 tabular-nums">
                                                            {item.estoque_minimo} un
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <span className="text-slate-400 block">Déficit</span>
                                                        <span className="font-semibold text-red-600 tabular-nums">
                                                            -{deficit} un
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="flex justify-end pt-1">
                                                    <Button
                                                        variant="secondary"
                                                        size="sm"
                                                        onClick={() =>
                                                            navigate("/movimentacoes", {
                                                                state: {
                                                                    preselectedProdutoId: item.id,
                                                                    abrirModal: true,
                                                                },
                                                            })
                                                        }
                                                    >
                                                        <ArrowLeftRight size={14} />
                                                        <span>Repor Estoque</span>
                                                    </Button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </>
                        )}
                    </Card>

                    <Card padding="none" className="overflow-hidden">
                        <CardHeader
                            action={
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => navigate("/movimentacoes")}
                                    className="text-slate-600 hover:text-slate-900"
                                >
                                    <span>Ver histórico completo</span>
                                    <ArrowRight size={14} />
                                </Button>
                            }
                        >
                            <CardTitle>Últimas Movimentações</CardTitle>
                            <CardDescription>
                                Registros recentes de entrada e saída no almoxarifado.
                            </CardDescription>
                        </CardHeader>

                        {movimentacoesRecentes.length === 0 ? (
                            <EmptyState
                                icon={ShieldCheck}
                                title="Nenhuma movimentação registrada"
                                description="Quando houver entradas ou saídas de mercadorias, o histórico recente será exibido aqui."
                                border="none"
                                className="py-10"
                            />
                        ) : (
                            <>
                                <div className="hidden md:block overflow-x-auto">
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
                                                    <tr
                                                        key={mov.id}
                                                        className="hover:bg-slate-50/75 transition-colors duration-150 ease-out"
                                                    >
                                                        <td className="px-5 py-3">
                                                            <span
                                                                className={`inline-flex items-center gap-1 font-medium ${
                                                                    isEntrada ? "text-emerald-700" : "text-slate-700"
                                                                }`}
                                                            >
                                                                {isEntrada ? (
                                                                    <ArrowDownRight
                                                                        size={15}
                                                                        className="text-emerald-600"
                                                                    />
                                                                ) : (
                                                                    <ArrowUpRight
                                                                        size={15}
                                                                        className="text-slate-500"
                                                                    />
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

                                <div className="md:hidden divide-y divide-slate-100">
                                    {movimentacoesRecentes.map((mov) => {
                                        const isEntrada = mov.tipo === "entrada";
                                        return (
                                            <div key={mov.id} className="p-4 space-y-2">
                                                <div className="flex items-start justify-between gap-2">
                                                    <div>
                                                        <h4 className="font-medium text-slate-900 text-sm">
                                                            {mov.produtos?.nome || "Produto"}
                                                        </h4>
                                                        <span className="font-mono text-xs text-slate-500">
                                                            {mov.produtos?.sku}
                                                        </span>
                                                    </div>
                                                    <span
                                                        className={`text-xs font-semibold ${
                                                            isEntrada ? "text-emerald-700" : "text-slate-700"
                                                        }`}
                                                    >
                                                        {isEntrada ? "+ Entrada" : "- Saída"}
                                                    </span>
                                                </div>

                                                <div className="flex items-center justify-between text-xs bg-slate-50 p-2.5 rounded-md">
                                                    <span className="text-slate-500">
                                                        {formatDate(mov.criada_em)}
                                                    </span>
                                                    <span
                                                        className={`font-semibold tabular-nums ${
                                                            isEntrada ? "text-emerald-700" : "text-slate-900"
                                                        }`}
                                                    >
                                                        {isEntrada ? "+" : "-"}
                                                        {mov.quantidade} un
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </>
                        )}
                    </Card>
                </>
            )}
        </div>
    );
}
