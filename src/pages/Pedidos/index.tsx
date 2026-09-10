import { Edit, Eye, Plus, Search, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { PageHeader } from "../../components/ui/PageHeader";
import { Select } from "../../components/ui/Select";
import { usePedidos, type PedidoCompleto } from "../../hooks/usePedidos";
import { formatCurrency, formatDate } from "../../utils/formatters";
import { PedidoDetalhesModal } from "./PedidoDetalhesModal";
import { PedidoFormModal } from "./PedidoFormModal";

export function Pedidos() {
    const {
        pedidos,
        loading,
        busca,
        setBusca,
        statusFiltro,
        setStatusFiltro,
        receberPedido,
        salvarPedido,
        deletePedido,
    } = usePedidos();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [pedidoSelecionado, setPedidoSelecionado] = useState<PedidoCompleto | null>(null);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [pedidoEditando, setPedidoEditando] = useState<PedidoCompleto | null>(null);

    function handleOpenCreate() {
        setPedidoEditando(null);
        setIsFormModalOpen(true);
    }

    function handleOpenEdit(pedido: PedidoCompleto) {
        setPedidoEditando(pedido);
        setIsFormModalOpen(true);
    }

    function handleOpenDetails(pedido: PedidoCompleto) {
        setPedidoSelecionado(pedido);
        setIsModalOpen(true);
    }

    async function handleDelete(id: string) {
        if (!window.confirm("Tem certeza que deseja excluir este pedido? Ação irreversível.")) return;

        const res = await deletePedido(id);
        if (!res.success) {
            alert(res.error);
        }
    }

    return (
        <div className="page-container">
            <PageHeader title="Pedidos de Compra" subtitle="Gerencie os pedidos para reposição de estoque.">
                <Button onClick={handleOpenCreate}>
                    <Plus size={18} style={{ marginRight: 8 }} />
                    Novo Pedido
                </Button>
            </PageHeader>

            <div className="filter-grid">
                <div className="search-wrapper">
                    <Search size={18} className="search-icon" />
                    <Input
                        placeholder="Buscar por número do pedido..."
                        value={busca}
                        onChange={(e) => setBusca(e.target.value)}
                        className="search-input"
                    />
                </div>
                <div>
                    <Select value={statusFiltro} onChange={(e) => setStatusFiltro(e.target.value)}>
                        <option value="">Todos os status</option>
                        <option value="rascunho">Rascunho</option>
                        <option value="enviado">Enviado</option>
                        <option value="concluido">Concluído</option>
                        <option value="cancelado">Cancelado</option>
                    </Select>
                </div>
            </div>

            <div className="table-container">
                {loading ? (
                    <div className="loading-state">Carregando pedidos...</div>
                ) : pedidos.length === 0 ? (
                    <div className="empty-state">Nenhum pedido encontrado.</div>
                ) : (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>ID Pedido</th>
                                <th>Fornecedor</th>
                                <th>Data de Emissão</th>
                                <th className="text-right">Valor Total</th>
                                <th className="text-center">Status</th>
                                <th className="text-center">Ações</th>
                            </tr>
                        </thead>
                        <motion.tbody
                            initial="hidden"
                            animate="visible"
                            variants={{
                                hidden: { opacity: 0 },
                                visible: {
                                    opacity: 1,
                                    transition: { staggerChildren: 0.05 },
                                },
                            }}
                        >
                            {pedidos.map((pedido) => (
                                <motion.tr
                                    key={pedido.id}
                                    variants={{
                                        hidden: { opacity: 0, x: -10 },
                                        visible: { opacity: 1, x: 0 },
                                    }}
                                >
                                    <td className="text-monospace fw600">#{pedido.id.substring(0, 8)}</td>
                                    <td className="fw500">{pedido.fornecedores?.razao_social || "-"}</td>
                                    <td className="text-secondary">{formatDate(pedido.criado_em)}</td>
                                    <td className="text-right fw600">{formatCurrency(pedido.valor_total)}</td>
                                    <td className="text-center">
                                        <Badge
                                            variant={
                                                pedido.status === "concluido"
                                                    ? "success"
                                                    : pedido.status === "cancelado"
                                                      ? "critical"
                                                      : pedido.status === "enviado"
                                                        ? "warning"
                                                        : "neutral"
                                            }
                                        >
                                            {pedido.status}
                                        </Badge>
                                    </td>
                                    <td
                                        className="text-center"
                                        style={{ display: "flex", gap: "8px", justifyContent: "center" }}
                                    >
                                        <Button
                                            variant="ghost"
                                            onClick={() => handleOpenDetails(pedido)}
                                            title="Ver Detalhes"
                                        >
                                            <Eye size={16} />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            onClick={() => handleOpenEdit(pedido)}
                                            title="Editar Pedido"
                                        >
                                            <Edit size={16} />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            onClick={() => handleDelete(pedido.id)}
                                            title="Excluir"
                                            style={{ color: "var(--color-danger-text)" }}
                                        >
                                            <Trash2 size={16} />
                                        </Button>
                                    </td>
                                </motion.tr>
                            ))}
                        </motion.tbody>
                    </table>
                )}
            </div>

            <PedidoFormModal
                isOpen={isFormModalOpen}
                onClose={() => setIsFormModalOpen(false)}
                pedido={pedidoEditando}
                onSave={salvarPedido}
            />

            <PedidoDetalhesModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                pedido={pedidoSelecionado}
                onReceberPedido={receberPedido}
            />
        </div>
    );
}
