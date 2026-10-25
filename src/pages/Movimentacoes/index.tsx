import { Plus, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { EmptyState } from "../../components/ui/EmptyState";
import { Input } from "../../components/ui/Input";
import { PageHeader } from "../../components/ui/PageHeader";
import { Pagination } from "../../components/ui/Pagination";
import { Select } from "../../components/ui/Select";
import { Skeleton } from "../../components/ui/Skeleton";
import { useMovimentacoes } from "../../hooks/useMovimentacoes";
import { formatDate } from "../../utils/formatters";
import { MovimentacaoFormModal } from "./MovimentacaoFormModal";

export function Movimentacoes() {
    const location = useLocation();
    const navigate = useNavigate();
    const {
        movimentacoes,
        produtos,
        totalMovimentacoes,
        pagina,
        setPagina,
        totalPaginas,
        itensPorPagina,
        loading,
        busca,
        setBusca,
        tipoFiltro,
        setTipoFiltro,
        produtoFiltro,
        setProdutoFiltro,
        recarregar,
    } = useMovimentacoes();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [preselectedProdutoId, setPreselectedProdutoId] = useState<string>("");

    useEffect(() => {
        const state = location.state as { preselectedProdutoId?: string; abrirModal?: boolean } | null;
        if (state?.abrirModal) {
            if (state?.preselectedProdutoId) {
                setPreselectedProdutoId(state.preselectedProdutoId);
            }
            setIsModalOpen(true);
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location.state, location.pathname, navigate]);

    function handleSuccess() {
        setIsModalOpen(false);
        setPreselectedProdutoId("");
        recarregar();
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title="Histórico de Movimentações"
                subtitle="Auditoria imutável de todas as entradas e saídas físicas do estoque."
            >
                <Button onClick={() => setIsModalOpen(true)}>
                    <Plus size={18} />
                    <span>Nova Movimentação</span>
                </Button>
            </PageHeader>

            <div className="p-3 sm:p-4 rounded-lg bg-white border border-slate-200 grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="relative sm:col-span-6">
                    <Search
                        size={15}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                    />
                    <Input
                        placeholder="Buscar por produto ou SKU..."
                        value={busca}
                        onChange={(e) => setBusca(e.target.value)}
                        className="pl-8.5!"
                    />
                </div>
                <div className="sm:col-span-3">
                    <Select value={produtoFiltro} onChange={(e) => setProdutoFiltro(e.target.value)}>
                        <option value="">Todos os produtos</option>
                        {produtos.map((p) => (
                            <option key={p.id} value={p.id}>
                                {p.nome}
                            </option>
                        ))}
                    </Select>
                </div>
                <div className="sm:col-span-3">
                    <Select value={tipoFiltro} onChange={(e) => setTipoFiltro(e.target.value)}>
                        <option value="">Todos os tipos</option>
                        <option value="entrada">Apenas Entradas</option>
                        <option value="saida">Apenas Saídas</option>
                    </Select>
                </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                {loading ? (
                    <div className="p-6 space-y-3">
                        <Skeleton className="w-full h-9" />
                        <Skeleton className="w-full h-9" />
                        <Skeleton className="w-full h-9" />
                    </div>
                ) : movimentacoes.length === 0 ? (
                    <EmptyState
                        title="Nenhuma movimentação encontrada"
                        description={
                            busca || tipoFiltro || produtoFiltro
                                ? "Tente redefinir os filtros de busca para encontrar registros."
                                : "Nenhuma entrada ou saída física foi registrada até o momento."
                        }
                        action={
                            !busca && !tipoFiltro && !produtoFiltro ? (
                                <Button size="sm" onClick={() => setIsModalOpen(true)}>
                                    <Plus size={16} />
                                    <span>Registrar Primeira Movimentação</span>
                                </Button>
                            ) : undefined
                        }
                    />
                ) : (
                    <>
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-left text-xs border-collapse">
                                <thead className="bg-slate-50/50 border-b border-slate-200 text-slate-600 font-medium">
                                    <tr>
                                        <th className="px-5 py-2.5">Tipo</th>
                                        <th className="px-5 py-2.5">Produto & SKU</th>
                                        <th className="px-5 py-2.5 text-right">Qtd. Movimentada</th>
                                        <th className="px-5 py-2.5">Operador Responsável</th>
                                        <th className="px-5 py-2.5">Data e Hora</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {movimentacoes.map((mov) => {
                                        const isEntrada = mov.tipo === "entrada";
                                        return (
                                            <tr
                                                key={mov.id}
                                                className="hover:bg-slate-50/75 transition-colors duration-150 ease-out"
                                            >
                                                <td className="px-5 py-3">
                                                    <span
                                                        className={`font-medium ${
                                                            isEntrada ? "text-emerald-700" : "text-slate-700"
                                                        }`}
                                                    >
                                                        {isEntrada ? "Entrada" : "Saída"}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-3">
                                                    <div className="font-medium text-slate-900">
                                                        {mov.produtos?.nome || "-"}
                                                    </div>
                                                    <div className="font-mono text-slate-400 mt-0.5">
                                                        {mov.produtos?.sku}
                                                    </div>
                                                    {mov.motivo && (
                                                        <div className="text-slate-500 italic mt-0.5">
                                                            "{mov.motivo}"
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-5 py-3 text-right">
                                                    <span
                                                        className={`font-semibold tabular-nums ${
                                                            isEntrada ? "text-emerald-700" : "text-slate-900"
                                                        }`}
                                                    >
                                                        {isEntrada ? "+" : "-"}
                                                        {mov.quantidade} un
                                                    </span>
                                                </td>
                                                <td className="px-5 py-3 text-slate-700 font-medium">
                                                    {mov.usuarios?.nome || mov.usuarios?.email || "Operador"}
                                                </td>
                                                <td className="px-5 py-3 text-slate-500">
                                                    {formatDate(mov.criada_em)}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        <div className="md:hidden divide-y divide-slate-100">
                            {movimentacoes.map((mov) => {
                                const isEntrada = mov.tipo === "entrada";
                                return (
                                    <div key={mov.id} className="p-4 space-y-2.5">
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <h4 className="font-medium text-slate-900 text-sm">
                                                    {mov.produtos?.nome || "-"}
                                                </h4>
                                                <span className="font-mono text-xs text-slate-500">
                                                    {mov.produtos?.sku}
                                                </span>
                                            </div>
                                            <span
                                                className={`text-xs font-medium ${
                                                    isEntrada ? "text-emerald-700" : "text-slate-700"
                                                }`}
                                            >
                                                {isEntrada ? "+ Entrada" : "- Saída"}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between text-xs bg-slate-50 p-2.5 rounded-md">
                                            <div className="text-slate-500">
                                                <div>Por: {mov.usuarios?.nome || "Operador"}</div>
                                                <div className="text-slate-400 mt-0.5">{formatDate(mov.criada_em)}</div>
                                            </div>
                                            <span
                                                className={`font-semibold tabular-nums text-sm ${
                                                    isEntrada ? "text-emerald-700" : "text-slate-900"
                                                }`}
                                            >
                                                {isEntrada ? "+" : "-"}
                                                {mov.quantidade} un
                                            </span>
                                        </div>

                                        {mov.motivo && (
                                            <p className="text-xs text-slate-500 italic px-1">"{mov.motivo}"</p>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        <Pagination
                            currentPage={pagina}
                            totalPages={totalPaginas}
                            totalItems={totalMovimentacoes}
                            pageSize={itensPorPagina}
                            onPageChange={setPagina}
                            itemName="movimentações"
                        />
                    </>
                )}
            </div>

            <MovimentacaoFormModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setPreselectedProdutoId("");
                }}
                produtos={produtos}
                onSuccess={handleSuccess}
                initialProdutoId={preselectedProdutoId}
            />
        </div>
    );
}
