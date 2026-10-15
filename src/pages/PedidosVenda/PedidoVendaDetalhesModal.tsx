import { AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import { useState } from "react";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";
import type { PedidoVendaCompleto } from "../../hooks/usePedidosVenda";
import { formatCurrency, formatDate } from "../../utils/formatters";

interface PedidoVendaDetalhesModalProps {
    isOpen: boolean;
    onClose: () => void;
    pedido: PedidoVendaCompleto | null;
    onFinalizarVenda: (id: string) => Promise<{ success: boolean; error?: string }>;
    onCancelarVenda: (id: string) => Promise<{ success: boolean; error?: string }>;
}

export function PedidoVendaDetalhesModal({
    isOpen,
    onClose,
    pedido,
    onFinalizarVenda,
    onCancelarVenda,
}: PedidoVendaDetalhesModalProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    if (!pedido) return null;

    async function handleFinalizar() {
        if (!pedido) return;
        if (!window.confirm("Deseja finalizar esta venda? O estoque dos produtos será baixado automaticamente."))
            return;

        setLoading(true);
        setError("");
        const res = await onFinalizarVenda(pedido.id);
        if (res.success) {
            onClose();
        } else {
            setError(res.error || "Erro ao finalizar pedido de venda.");
        }
        setLoading(false);
    }

    async function handleCancelar() {
        if (!pedido) return;
        if (!window.confirm("Tem certeza que deseja cancelar este pedido de venda?")) return;

        setLoading(true);
        setError("");
        const res = await onCancelarVenda(pedido.id);
        if (res.success) {
            onClose();
        } else {
            setError(res.error || "Erro ao cancelar pedido de venda.");
        }
        setLoading(false);
    }

    const isRascunho = pedido.status === "rascunho";

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
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Detalhes da Venda #${pedido.numero || pedido.id.slice(0, 8)}`}
            width="large"
        >
            <div className="space-y-6">
                {error && (
                    <div className="p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-2">
                        <AlertCircle size={15} className="shrink-0 text-red-600" />
                        <span>{error}</span>
                    </div>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-lg bg-slate-50 border border-slate-200">
                    <div>
                        <span className="text-xs text-slate-500 font-medium block">Cliente</span>
                        <span className="text-sm font-semibold text-slate-900 truncate block mt-0.5">
                            {pedido.clientes?.nome || "Consumidor Final"}
                        </span>
                        {pedido.clientes?.documento && (
                            <span className="text-[11px] text-slate-400 font-mono block mt-0.5">
                                {pedido.clientes.documento}
                            </span>
                        )}
                    </div>
                    <div>
                        <span className="text-xs text-slate-500 font-medium block">Data da Venda</span>
                        <span className="text-sm font-semibold text-slate-900 block mt-0.5">
                            {formatDate(pedido.criado_em)}
                        </span>
                    </div>
                    <div>
                        <span className="text-xs text-slate-500 font-medium block">Situação</span>
                        <div className="mt-1">{getStatusBadge(pedido.status)}</div>
                    </div>
                    <div>
                        <span className="text-xs text-slate-500 font-medium block">Valor Faturado</span>
                        <span className="text-sm font-semibold text-slate-900 block mt-0.5 tabular-nums">
                            {formatCurrency(pedido.valor_total)}
                        </span>
                    </div>
                </div>

                {pedido.observacoes && (
                    <div className="p-3 rounded-md bg-slate-50 border border-slate-200 text-xs text-slate-700">
                        <strong className="font-semibold text-slate-900 block mb-0.5">Observações:</strong>
                        <span>{pedido.observacoes}</span>
                    </div>
                )}

                <div className="space-y-2">
                    <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Itens da Venda</h3>
                    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
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
                                    {pedido.itens_pedido_venda?.map((item) => (
                                        <tr key={item.id} className="hover:bg-slate-50/50">
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
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100">
                    <div>
                        {isRascunho && (
                            <p className="text-xs text-slate-500">
                                A finalização dará baixa imediata no saldo físico dos produtos no estoque.
                            </p>
                        )}
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto justify-end flex-wrap">
                        <Button type="button" variant="secondary" onClick={onClose}>
                            Fechar
                        </Button>
                        {isRascunho && (
                            <>
                                <Button type="button" variant="danger" disabled={loading} onClick={handleCancelar}>
                                    <XCircle size={16} />
                                    <span>Cancelar Venda</span>
                                </Button>
                                <Button type="button" variant="primary" disabled={loading} onClick={handleFinalizar}>
                                    <CheckCircle2 size={16} />
                                    <span>{loading ? "Processando Baixa..." : "Finalizar Venda"}</span>
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </Modal>
    );
}
