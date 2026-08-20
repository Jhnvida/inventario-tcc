import { Edit, Eye, Plus, Search } from "lucide-react";
import { useState } from "react";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { usePedidos, type PedidoCompleto } from "../../hooks/usePedidos";
import { formatCurrency, formatDate } from "../../utils/formatters";
import { PedidoDetalhesModal } from "./PedidoDetalhesModal";
import { PedidoFormModal } from "./PedidoFormModal";
import styles from "./styles.module.css";

export function Pedidos() {
    const { pedidos, loading, busca, setBusca, statusFiltro, setStatusFiltro, receberPedido, salvarPedido } =
        usePedidos();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [pedidoSelecionado, setPedidoSelecionado] = useState<PedidoCompleto | null>(null);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [pedidoEditando, setPedidoEditando] = useState<PedidoCompleto | null>(null);

    const handleOpenForm = (pedido?: PedidoCompleto) => {
        setPedidoEditando(pedido || null);
        setIsFormModalOpen(true);
    };

    const handleOpenDetails = (pedido: PedidoCompleto) => {
        setPedidoSelecionado(pedido);
        setIsModalOpen(true);
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div>
                    <h1 className={styles.title}>Pedidos de Compra</h1>
                    <p className={styles.subtitle}>
                        Gerencie os pedidos junto aos fornecedores e controle os recebimentos.
                    </p>
                </div>
                <Button onClick={() => handleOpenForm()}>
                    <Plus size={20} className={styles.mr2} /> Novo Pedido
                </Button>
            </header>

            <div className={styles.filter_grid}>
                <div className={styles.search_wrapper}>
                    <Search size={18} className={styles.search_icon} />
                    <Input
                        placeholder="Buscar por fornecedor..."
                        value={busca}
                        onChange={(e) => setBusca(e.target.value)}
                        className={styles.search_input}
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

            <div className={styles.table_container}>
                {loading ? (
                    <div className={styles.loading_state}>Carregando pedidos...</div>
                ) : pedidos.length === 0 ? (
                    <div className={styles.empty_state}>Nenhum pedido encontrado.</div>
                ) : (
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>ID Pedido</th>
                                <th>Fornecedor</th>
                                <th>Data de Emissão</th>
                                <th className={styles.text_right}>Valor Total</th>
                                <th className={styles.text_center}>Status</th>
                                <th className={styles.text_center}>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pedidos.map((pedido) => (
                                <tr key={pedido.id}>
                                    <td className={styles.text_monospace}>#{pedido.id.substring(0, 8)}</td>
                                    <td className={styles.fw500}>{pedido.fornecedores?.razao_social || "-"}</td>
                                    <td className={styles.text_secondary}>{formatDate(pedido.criado_em)}</td>
                                    <td className={`${styles.text_right} ${styles.fw600}`}>
                                        {formatCurrency(pedido.valor_total)}
                                    </td>
                                    <td className={styles.text_center}>
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
                                    <td className={styles.text_center}>
                                        <Button
                                            variant="ghost"
                                            onClick={() => handleOpenDetails(pedido)}
                                            title="Ver Detalhes"
                                        >
                                            <Eye size={16} />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            onClick={() => handleOpenForm(pedido)}
                                            title="Editar Pedido"
                                        >
                                            <Edit size={16} />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
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
