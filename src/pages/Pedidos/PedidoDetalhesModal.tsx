import { AlertCircle, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";
import type { PedidoCompleto } from "../../hooks/usePedidos";
import { formatCurrency, formatDate } from "../../utils/formatters";

interface PedidoDetalhesModalProps {
    isOpen: boolean;
    onClose: () => void;
    pedido: PedidoCompleto | null;
    onReceberPedido: (id: string) => Promise<{ success: boolean; error?: string }>;
}

export function PedidoDetalhesModal({ isOpen, onClose, pedido, onReceberPedido }: PedidoDetalhesModalProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    if (!pedido) return null;

    async function handleReceber() {
        if (!pedido) return;
        setLoading(true);
        setError("");
        const res = await onReceberPedido(pedido.id);
        if (res.success) {
            onClose();
        } else {
            setError(res.error || "Erro ao receber pedido.");
        }
        setLoading(false);
    }

    const isRecebivel = pedido.status === "enviado";

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "concluido":
                return <Badge variant="success">Concluído</Badge>;
            case "enviado":
                return <Badge variant="warning">Enviado</Badge>;
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
            title={`Detalhes do Pedido #${pedido.id.substring(0, 8)}`}
            width="large"
        >
            <div className="space-y-6">
                {error && (
                    <div className="p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-2 animate-fade-in">
                        <AlertCircle size={15} className="shrink-0 text-red-600" />
                        <span>{error}</span>
                    </div>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-lg bg-slate-50 border border-slate-200">
                    <div>
                        <span className="text-xs text-slate-500 font-medium block">Fornecedor</span>
                        <span className="text-sm font-semibold text-slate-900 truncate block mt-0.5">
                            {pedido.fornecedores?.razao_social || "Desconhecido"}
                        </span>
                    </div>
                    <div>
                        <span className="text-xs text-slate-500 font-medium block">Data de Criação</span>
                        <span className="text-sm font-semibold text-slate-900 block mt-0.5">
                            {formatDate(pedido.criado_em)}
                        </span>
                    </div>
                    <div>
                        <span className="text-xs text-slate-500 font-medium block">Situação</span>
                        <div className="mt-1">{getStatusBadge(pedido.status)}</div>
                    </div>
                    <div>
                        <span className="text-xs text-slate-500 font-medium block">Valor Total</span>
                        <span className="text-sm font-semibold text-slate-900 block mt-0.5 tabular-nums">
                            {formatCurrency(pedido.valor_total)}
                        </span>
                    </div>
                </div>

                <div className="space-y-2">
                    <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Itens do Pedido</h3>
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
                                    {pedido.itens_pedido?.map((item) => (
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
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100">
                    <div>
                        {isRecebivel && (
                            <p className="text-xs text-slate-500">
                                O recebimento dará entrada automática dos itens no estoque via Stored Procedure.
                            </p>
                        )}
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                        <Button type="button" variant="secondary" onClick={onClose}>
                            Fechar
                        </Button>
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
