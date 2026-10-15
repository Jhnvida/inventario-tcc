import { Edit2, Eye, Plus, Search, Trash2 } from "lucide-react";
import { useState } from "react";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { EmptyState } from "../../components/ui/EmptyState";
import { Input } from "../../components/ui/Input";
import { PageHeader } from "../../components/ui/PageHeader";
import { Pagination } from "../../components/ui/Pagination";
import { Select } from "../../components/ui/Select";
import { Skeleton } from "../../components/ui/Skeleton";
import { usePedidosVenda, type PedidoVendaCompleto } from "../../hooks/usePedidosVenda";
import { formatCurrency, formatDate } from "../../utils/formatters";
import { PedidoVendaDetalhesModal } from "./PedidoVendaDetalhesModal";
import { PedidoVendaFormModal } from "./PedidoVendaFormModal";

export function PedidosVenda() {
    const {
        pedidos,
        totalPedidos,
        pagina,
        setPagina,
        totalPaginas,
        itensPorPagina,
        loading,
        busca,
        setBusca,
        statusFiltro,
        setStatusFiltro,
        finalizarVenda,
        cancelarVenda,
        salvarPedidoVenda,
        deletePedidoVenda,
    } = usePedidosVenda();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [pedidoSelecionado, setPedidoSelecionado] = useState<PedidoVendaCompleto | null>(null);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [pedidoEditando, setPedidoEditando] = useState<PedidoVendaCompleto | null>(null);

    function handleOpenCreate() {
        setPedidoEditando(null);
        setIsFormModalOpen(true);
    }

    function handleOpenEdit(pedido: PedidoVendaCompleto) {
        setPedidoEditando(pedido);
        setIsFormModalOpen(true);
    }

    function handleOpenDetails(pedido: PedidoVendaCompleto) {
        setPedidoSelecionado(pedido);
        setIsModalOpen(true);
    }

    async function handleDelete(id: string) {
        if (!window.confirm("Tem certeza que deseja excluir este pedido de venda? Ação irreversível.")) return;

        const res = await deletePedidoVenda(id);
        if (!res.success) {
            alert(res.error);
        }
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "concluido":
                return <Badge variant="success">Concluído</Badge>;
            case "cancelado":
                return <Badge variant="critical">Cancelado</Badge>;
            default:
                return <Badge variant="neutral">Rascunho</Badge>;
        }
    };

    return (
        <div className="space-y-6">
            <PageHeader
                title="Pedidos de Venda"
                subtitle="Gerencie as saídas comerciais, faturamento para clientes e baixa de estoque."
            >
                <Button onClick={handleOpenCreate}>
                    <Plus size={18} />
                    <span>Nova Venda</span>
                </Button>
            </PageHeader>

            <div className="p-3 sm:p-4 rounded-lg bg-white border border-slate-200 flex flex-col sm:flex-row items-center gap-3">
                <div className="relative flex-1 w-full">
                    <Search
                        size={15}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                    />
                    <Input
                        placeholder="Buscar por cliente ou número da venda..."
                        value={busca}
                        onChange={(e) => setBusca(e.target.value)}
                        className="pl-8.5!"
                    />
                </div>
                <div className="w-full sm:w-64 shrink-0">
                    <Select value={statusFiltro} onChange={(e) => setStatusFiltro(e.target.value)}>
                        <option value="">Todos os status</option>
                        <option value="rascunho">Rascunho</option>
                        <option value="concluido">Concluído</option>
                        <option value="cancelado">Cancelado</option>
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
                ) : pedidos.length === 0 ? (
                    <EmptyState
                        title="Nenhum pedido de venda encontrado"
                        description={
                            busca || statusFiltro
                                ? "Tente ajustar os termos da busca para encontrar registros."
                                : "Nenhuma venda registrada até o momento."
                        }
                        action={
                            !busca && !statusFiltro ? (
                                <Button size="sm" onClick={handleOpenCreate}>
                                    <Plus size={16} />
                                    <span>Registrar Nova Venda</span>
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
                                        <th className="px-5 py-2.5">Nº Venda</th>
                                        <th className="px-5 py-2.5">Cliente</th>
                                        <th className="px-5 py-2.5">Vendedor / Resp.</th>
                                        <th className="px-5 py-2.5">Data</th>
                                        <th className="px-5 py-2.5 text-right">Valor Total</th>
                                        <th className="px-5 py-2.5 text-center">Status</th>
                                        <th className="px-5 py-2.5 text-center">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {pedidos.map((pedido) => (
                                        <tr key={pedido.id} className="hover:bg-slate-50/60 transition-colors">
                                            <td className="px-5 py-3">
                                                <span className="font-mono text-slate-500">
                                                    #{pedido.numero || pedido.id.slice(0, 8)}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3">
                                                <div className="font-medium text-slate-900">
                                                    {pedido.clientes?.nome || "Consumidor Final"}
                                                </div>
                                                {pedido.clientes?.documento && (
                                                    <div className="text-[11px] text-slate-400 mt-0.5 font-mono">
                                                        {pedido.clientes.tipo_pessoa || "Doc"}:{" "}
                                                        {pedido.clientes.documento}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-5 py-3 text-slate-700 font-medium">
                                                {pedido.usuarios?.nome || "Sistema"}
                                            </td>
                                            <td className="px-5 py-3 text-slate-500">{formatDate(pedido.criado_em)}</td>
                                            <td className="px-5 py-3 text-right font-medium text-slate-900 tabular-nums">
                                                {formatCurrency(pedido.valor_total)}
                                            </td>
                                            <td className="px-5 py-3 text-center">{getStatusBadge(pedido.status)}</td>
                                            <td className="px-5 py-3">
                                                <div className="flex items-center justify-center gap-1">
                                                    <button
                                                        type="button"
                                                        className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                                                        onClick={() => handleOpenDetails(pedido)}
                                                        title="Ver Detalhes e Finalizar"
                                                    >
                                                        <Eye size={16} />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                                                        onClick={() => handleOpenEdit(pedido)}
                                                        title="Editar Venda"
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="p-1.5 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                                                        onClick={() => handleDelete(pedido.id)}
                                                        title="Excluir"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="md:hidden divide-y divide-slate-100">
                            {pedidos.map((pedido) => (
                                <div key={pedido.id} className="p-4 space-y-2.5">
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <span className="font-mono text-xs text-slate-400">
                                                #{pedido.numero || pedido.id.slice(0, 8)}
                                            </span>
                                            <h4 className="font-medium text-slate-900 text-sm">
                                                {pedido.clientes?.nome || "Consumidor Final"}
                                            </h4>
                                        </div>
                                        {getStatusBadge(pedido.status)}
                                    </div>

                                    <div className="flex items-center justify-between text-xs bg-slate-50 p-2.5 rounded-md">
                                        <span className="text-slate-400">{formatDate(pedido.criado_em)}</span>
                                        <span className="font-semibold text-slate-900 tabular-nums">
                                            {formatCurrency(pedido.valor_total)}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100">
                                        <Button variant="secondary" size="sm" onClick={() => handleOpenDetails(pedido)}>
                                            <Eye size={15} />
                                            <span>Detalhes</span>
                                        </Button>
                                        <Button variant="secondary" size="sm" onClick={() => handleOpenEdit(pedido)}>
                                            <Edit2 size={15} />
                                            <span>Editar</span>
                                        </Button>
                                        <Button variant="danger" size="sm" onClick={() => handleDelete(pedido.id)}>
                                            <Trash2 size={15} />
                                            <span>Excluir</span>
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <Pagination
                            currentPage={pagina}
                            totalPages={totalPaginas}
                            totalItems={totalPedidos}
                            pageSize={itensPorPagina}
                            onPageChange={setPagina}
                            itemName="vendas"
                        />
                    </>
                )}
            </div>

            <PedidoVendaFormModal
                isOpen={isFormModalOpen}
                onClose={() => setIsFormModalOpen(false)}
                pedido={pedidoEditando}
                onSave={salvarPedidoVenda}
            />

            <PedidoVendaDetalhesModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                pedido={pedidoSelecionado}
                onFinalizarVenda={finalizarVenda}
                onCancelarVenda={cancelarVenda}
            />
        </div>
    );
}
