import { CheckCircle2, Edit2 } from "lucide-react";
import { useRef, useState } from "react";
import { Alert } from "../../components/ui/Alert";
import { StatusBadge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Modal } from "../../components/ui/Modal";
import type { PedidoCompleto } from "../../hooks/usePedidos";
import { formatCurrency, formatDate } from "../../utils/formatters";

interface PedidoDetalhesModalProps {
    isOpen: boolean;
    onClose: () => void;
    pedido: PedidoCompleto | null;
    onReceberPedido: (id: string) => Promise<{ success: boolean; error?: string }>;
    onEditar?: (pedido: PedidoCompleto) => void;
}

export function PedidoDetalhesModal({
    isOpen,
    onClose,
    pedido,
    onReceberPedido,
    onEditar,
}: PedidoDetalhesModalProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const activePedidoRef = useRef<PedidoCompleto | null>(pedido);

    if (pedido) {
        activePedidoRef.current = pedido;
    }

    const currentPedido = pedido ?? activePedidoRef.current;
    if (!currentPedido) return null;

    async function handleReceber() {
        if (!currentPedido) return;
        setLoading(true);
        setError("");
        const res = await onReceberPedido(currentPedido.id);
        if (res.success) {
            onClose();
        } else {
            setError(res.error || "Erro ao receber pedido.");
        }
        setLoading(false);
    }

    const isRecebivel = currentPedido.status === "enviado";

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Detalhes do Pedido #${currentPedido.id.substring(0, 8)}`}
            subtitle="Consulta e conferência de materiais enviados pelo fornecedor"
            width="large"
        >
            <div className="space-y-6">
                {error && <Alert variant="error">{error}</Alert>}

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-lg bg-slate-50 border border-slate-200">
                    <div>
                        <span className="text-xs text-slate-500 font-medium block">Fornecedor</span>
                        <span className="text-sm font-semibold text-slate-900 truncate block mt-0.5">
                            {currentPedido.fornecedores?.razao_social || "Desconhecido"}
                        </span>
                    </div>
                    <div>
                        <span className="text-xs text-slate-500 font-medium block">Data de Criação</span>
                        <span className="text-sm font-semibold text-slate-900 block mt-0.5">
                            {formatDate(currentPedido.criado_em)}
                        </span>
                    </div>
                    <div>
                        <span className="text-xs text-slate-500 font-medium block">Situação</span>
                        <div className="mt-1">
                            <StatusBadge status={currentPedido.status} />
                        </div>
                    </div>
                    <div>
                        <span className="text-xs text-slate-500 font-medium block">Valor Total</span>
                        <span className="text-sm font-semibold text-slate-900 block mt-0.5 tabular-nums">
                            {formatCurrency(currentPedido.valor_total)}
                        </span>
                    </div>
                </div>

                <div className="space-y-2">
                    <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Itens do Pedido</h3>
                    <Card padding="none" className="overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs border-collapse">
                                <thead className="bg-slate-50/50 border-b border-slate-200 text-slate-600 font-medium">
                                    <tr>
                                        <th className="px-5 py-2.5">Produto & SKU</th>
                                        <th className="px-5 py-2.5 text-right">Quantidade</th>
                                        <th className="px-5 py-2.5 text-right">Preço Unitário</th>
                                        <th className="px-5 py-2.5 text-right">Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {currentPedido.itens_pedido?.map((item) => (
                                        <tr
                                            key={item.id}
                                            className="hover:bg-slate-50/75 transition-colors duration-150 ease-out"
                                        >
                                            <td className="px-5 py-3">
                                                <div className="font-medium text-slate-900">{item.produtos?.nome}</div>
                                                <div className="font-mono text-slate-500">{item.produtos?.sku}</div>
                                            </td>
                                            <td className="px-5 py-3 text-right font-medium text-slate-900 tabular-nums">
                                                {item.quantidade} un
                                            </td>
                                            <td className="px-5 py-3 text-right text-slate-600 tabular-nums">
                                                {formatCurrency(item.preco_unitario)}
                                            </td>
                                            <td className="px-5 py-3 text-right font-semibold text-slate-900 tabular-nums">
                                                {formatCurrency(item.quantidade * item.preco_unitario)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100">
                    <div>
                        {isRecebivel && (
                            <p className="text-xs text-slate-500">
                                O recebimento dará entrada automática dos itens no estoque via Stored Procedure.
                            </p>
                        )}
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto justify-end flex-wrap">
                        <Button type="button" variant="secondary" onClick={onClose}>
                            Fechar
                        </Button>
                        {onEditar && currentPedido.status !== "concluido" && currentPedido.status !== "cancelado" && (
                            <Button type="button" variant="secondary" onClick={() => onEditar(currentPedido)}>
                                <Edit2 size={15} />
                                <span>Editar Pedido</span>
                            </Button>
                        )}
                        {isRecebivel && (
                            <Button type="button" variant="primary" disabled={loading} onClick={handleReceber}>
                                <CheckCircle2 size={16} />
                                <span>{loading ? "Processando Recebimento..." : "Receber no Estoque"}</span>
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </Modal>
    );
}
