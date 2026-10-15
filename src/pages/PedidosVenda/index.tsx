import { Edit, Eye, Plus, Search, Trash2 } from "lucide-react";
import { useState } from "react";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { PageHeader } from "../../components/ui/PageHeader";
import { Pagination } from "../../components/ui/Pagination";
import { Select } from "../../components/ui/Select";
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

    return (
        <div className="page-container">
            <PageHeader
                title="Pedidos de Venda"
                subtitle="Gerencie as saídas de produtos, orçamentos e vendas para clientes."
            >
                <Button onClick={handleOpenCreate}>
                    <Plus size={18} style={{ marginRight: 8 }} />
                    Nova Venda
                </Button>
            </PageHeader>

            <div className="filter-grid">
                <div className="search-wrapper">
                    <Search size={18} className="search-icon" />
                    <Input
                        placeholder="Buscar por cliente ou número da venda..."
                        value={busca}
                        onChange={(e) => setBusca(e.target.value)}
                        className="search-input"
                    />
                </div>
                <div>
                    <Select value={statusFiltro} onChange={(e) => setStatusFiltro(e.target.value)}>
                        <option value="">Todos os status</option>
                        <option value="rascunho">Rascunho</option>
                        <option value="concluido">Concluído</option>
                        <option value="cancelado">Cancelado</option>
                    </Select>
                </div>
            </div>

            <div className="table-container">
                {loading ? (
                    <div className="loading-state">Carregando vendas...</div>
                ) : pedidos.length === 0 ? (
                    <div className="empty-state">Nenhum pedido de venda encontrado.</div>
                ) : (
                    <>
                        <table className="data-table hidden-mobile">
                            <thead>
                                <tr>
                                    <th>Nº Venda</th>
                                    <th>Cliente</th>
                                    <th>Data</th>
                                    <th className="text-right">Valor Total</th>
                                    <th className="text-center">Status</th>
                                    <th className="text-center">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pedidos.map((pedido) => (
                                    <tr key={pedido.id}>
                                        <td className="text-monospace fw600">
                                            #{pedido.numero || pedido.id.slice(0, 8)}
                                        </td>
                                        <td>
                                            <div className="fw500">{pedido.clientes?.nome || "-"}</div>
                                            {pedido.clientes?.tipo_pessoa && (
                                                <div className="text-secondary" style={{ fontSize: "0.85em" }}>
                                                    {pedido.clientes.tipo_pessoa}
                                                    {pedido.clientes.documento ? ` • ${pedido.clientes.documento}` : ""}
                                                </div>
                                            )}
                                        </td>
                                        <td className="text-secondary">{formatDate(pedido.criado_em)}</td>
                                        <td className="text-right fw600">{formatCurrency(pedido.valor_total)}</td>
                                        <td className="text-center">
                                            <Badge
                                                variant={
                                                    pedido.status === "concluido"
                                                        ? "success"
                                                        : pedido.status === "cancelado"
                                                          ? "critical"
                                                          : "neutral"
                                                }
                                            >
                                                {pedido.status === "concluido"
                                                    ? "Concluído"
                                                    : pedido.status === "cancelado"
                                                      ? "Cancelado"
                                                      : "Rascunho"}
                                            </Badge>
                                        </td>
                                        <td className="text-center">
                                            <div className="table-actions" style={{ justifyContent: "center" }}>
                                                <Button
                                                    variant="ghost"
                                                    onClick={() => handleOpenDetails(pedido)}
                                                    title="Ver Detalhes"
                                                >
                                                    <Eye size={16} />
                                                </Button>

                                                {pedido.status === "rascunho" && (
                                                    <>
                                                        <Button
                                                            variant="ghost"
                                                            onClick={() => handleOpenEdit(pedido)}
                                                            title="Editar Venda"
                                                        >
                                                            <Edit size={16} />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            onClick={() => handleDelete(pedido.id)}
                                                            title="Excluir Venda"
                                                            style={{ color: "var(--color-danger-text)" }}
                                                        >
                                                            <Trash2 size={16} />
                                                        </Button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <div className="mobile-cards-list mobile-only">
                            {pedidos.map((pedido) => (
                                <div key={pedido.id} className="mobile-card">
                                    <div className="mobile-card-header">
                                        <div>
                                            <div className="mobile-card-title">
                                                #{pedido.numero || pedido.id.slice(0, 8)} - {pedido.clientes?.nome}
                                            </div>
                                            <div className="mobile-card-subtitle">{formatDate(pedido.criado_em)}</div>
                                        </div>
                                        <Badge
                                            variant={
                                                pedido.status === "concluido"
                                                    ? "success"
                                                    : pedido.status === "cancelado"
                                                      ? "critical"
                                                      : "neutral"
                                            }
                                        >
                                            {pedido.status}
                                        </Badge>
                                    </div>
                                    <div className="mobile-card-body">
                                        <div className="mobile-card-field">
                                            <span className="mobile-card-label">Valor Total:</span>
                                            <span className="mobile-card-value fw600">
                                                {formatCurrency(pedido.valor_total)}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="mobile-card-actions">
                                        <Button
                                            variant="secondary"
                                            onClick={() => handleOpenDetails(pedido)}
                                            style={{ flex: 1 }}
                                        >
                                            <Eye size={16} style={{ marginRight: 6 }} /> Detalhes
                                        </Button>
                                        {pedido.status === "rascunho" && (
                                            <>
                                                <Button variant="ghost" onClick={() => handleOpenEdit(pedido)}>
                                                    <Edit size={16} />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    onClick={() => handleDelete(pedido.id)}
                                                    style={{ color: "var(--color-danger-text)" }}
                                                >
                                                    <Trash2 size={16} />
                                                </Button>
                                            </>
                                        )}
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
                onClose={() => {
                    setIsModalOpen(false);
                    setPedidoSelecionado(null);
                }}
                pedido={pedidoSelecionado}
                onFinalizarVenda={finalizarVenda}
                onCancelarVenda={cancelarVenda}
            />
        </div>
    );
}
