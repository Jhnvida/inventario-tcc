import { AlertCircle, Plus, Trash2 } from "lucide-react";
import { useEffect, useState, type SubmitEvent } from "react";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Modal } from "../../components/ui/Modal";
import { Select } from "../../components/ui/Select";
import { useClientes } from "../../hooks/useClientes";
import type { PedidoVendaCompleto } from "../../hooks/usePedidosVenda";
import { useProdutos } from "../../hooks/useProdutos";
import { formatCurrency } from "../../utils/formatters";

interface ItemPedidoVendaForm {
    produto_id: string;
    quantidade: number;
    preco_unitario: number;
}

interface PedidoVendaFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    pedido?: PedidoVendaCompleto | null;
    onSave: (
        pedidoData: {
            cliente_id: string;
            observacoes?: string | null;
            valor_total: number;
        },
        itens: ItemPedidoVendaForm[],
        pedidoId?: string,
    ) => Promise<{ success: boolean; error?: string }>;
}

export function PedidoVendaFormModal({ isOpen, onClose, pedido, onSave }: PedidoVendaFormModalProps) {
    const { clientes } = useClientes();
    const { produtos } = useProdutos();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [clienteId, setClienteId] = useState("");
    const [observacoes, setObservacoes] = useState("");
    const [itens, setItens] = useState<ItemPedidoVendaForm[]>([]);

    useEffect(() => {
        if (pedido) {
            setClienteId(pedido.cliente_id);
            setObservacoes(pedido.observacoes || "");
            if (pedido.itens_pedido_venda) {
                setItens(
                    pedido.itens_pedido_venda.map((ip) => ({
                        produto_id: ip.produto_id,
                        quantidade: ip.quantidade,
                        preco_unitario: ip.preco_unitario,
                    })),
                );
            }
        } else {
            setClienteId("");
            setObservacoes("");
            setItens([]);
        }
        setError(null);
    }, [pedido, isOpen]);

    function handleAdicionarItem() {
        setItens([...itens, { produto_id: "", quantidade: 1, preco_unitario: 0 }]);
    }

    function handleRemoverItem(index: number) {
        setItens(itens.filter((_, i) => i !== index));
    }

    function handleItemChange(index: number, field: keyof ItemPedidoVendaForm, value: string | number) {
        const newItens = [...itens];

        if (field === "produto_id") {
            const produtoSelecionado = produtos.find((p) => p.id === value);
            newItens[index] = {
                ...newItens[index],
                produto_id: value as string,
                preco_unitario: produtoSelecionado ? produtoSelecionado.preco : 0,
            };
        } else {
            newItens[index] = { ...newItens[index], [field]: Number(value) };
        }

        setItens(newItens);
    }

    const valorTotal = itens.reduce((acc, item) => acc + item.quantidade * item.preco_unitario, 0);

    async function handleSubmit(e: SubmitEvent) {
        e.preventDefault();
        setError(null);

        if (!clienteId) {
            setError("Selecione um cliente para a venda.");
            return;
        }

        if (itens.length === 0) {
            setError("Adicione pelo menos um produto à venda.");
            return;
        }

        for (const item of itens) {
            if (!item.produto_id) {
                setError("Selecione todos os produtos da lista.");
                return;
            }
            if (item.quantidade <= 0) {
                setError("A quantidade de todos os itens deve ser maior que zero.");
                return;
            }
        }

        setLoading(true);

        const res = await onSave(
            {
                cliente_id: clienteId,
                observacoes: observacoes.trim() || null,
                valor_total: valorTotal,
            },
            itens,
            pedido?.id,
        );

        if (res.success) {
            onClose();
        } else {
            setError(res.error || "Ocorreu um erro ao salvar o pedido de venda.");
        }

        setLoading(false);
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={pedido ? `Editar Venda #${pedido.numero || pedido.id.slice(0, 8)}` : "Nova Ordem de Venda"}
            width="large"
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                    <div className="p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-2">
                        <AlertCircle size={15} className="shrink-0 text-red-600" />
                        <span>{error}</span>
                    </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Select
                        label="Cliente Comprador"
                        value={clienteId}
                        onChange={(e) => setClienteId(e.target.value)}
                        required
                    >
                        <option value="">Selecione um cliente...</option>
                        {clientes.map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.nome} {c.documento ? `(${c.tipo_pessoa}: ${c.documento})` : ""}
                            </option>
                        ))}
                    </Select>

                    <Input
                        label="Observações / Condições Comerciais"
                        placeholder="Ex: Entrega prioritária, faturamento em 15 dias..."
                        value={observacoes}
                        onChange={(e) => setObservacoes(e.target.value)}
                    />
                </div>

                <div className="space-y-3 pt-2 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                            Produtos da Venda
                        </h3>
                        <Button type="button" variant="secondary" size="sm" onClick={handleAdicionarItem}>
                            <Plus size={16} />
                            <span>Adicionar Produto</span>
                        </Button>
                    </div>

                    {itens.length === 0 ? (
                        <div className="p-8 text-center text-xs text-slate-400 bg-slate-50 rounded-md border border-dashed border-slate-300">
                            Nenhum item adicionado à venda. Clique em "Adicionar Produto" para montar o pedido.
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {itens.map((item, idx) => (
                                <div
                                    key={idx}
                                    className="p-3 rounded-md bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center gap-3"
                                >
                                    <div className="flex-1 w-full">
                                        <Select
                                            value={item.produto_id}
                                            onChange={(e) => handleItemChange(idx, "produto_id", e.target.value)}
                                            required
                                        >
                                            <option value="">Selecione o produto...</option>
                                            {produtos.map((p) => (
                                                <option key={p.id} value={p.id}>
                                                    {p.nome} (Estoque: {p.quantidade} un) — {formatCurrency(p.preco)}
                                                </option>
                                            ))}
                                        </Select>
                                    </div>

                                    <div className="w-full sm:w-28">
                                        <Input
                                            type="number"
                                            min="1"
                                            placeholder="Qtd"
                                            value={item.quantidade}
                                            onChange={(e) => handleItemChange(idx, "quantidade", e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div className="w-full sm:w-36">
                                        <Input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            placeholder="Preço (R$)"
                                            value={item.preco_unitario}
                                            onChange={(e) => handleItemChange(idx, "preco_unitario", e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div className="w-full sm:w-32 text-right font-medium text-xs text-slate-900 tabular-nums">
                                        {formatCurrency(item.quantidade * item.preco_unitario)}
                                    </div>

                                    <button
                                        type="button"
                                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                                        onClick={() => handleRemoverItem(idx)}
                                        title="Remover produto"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-left w-full sm:w-auto">
                        <span className="text-xs text-slate-500 block">Total da Venda</span>
                        <span className="text-xl font-semibold text-slate-900 tabular-nums">
                            {formatCurrency(valorTotal)}
                        </span>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                        <Button type="button" variant="secondary" onClick={onClose}>
                            Cancelar
                        </Button>
                        <Button type="submit" variant="primary" disabled={loading}>
                            {loading ? "Salvando..." : pedido ? "Atualizar Venda" : "Concluir Ordem"}
                        </Button>
                    </div>
                </div>
            </form>
        </Modal>
    );
}
