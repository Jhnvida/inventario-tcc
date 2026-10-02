import { Plus, Trash2 } from "lucide-react";
import { useEffect, useState, type SubmitEvent } from "react";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Modal } from "../../components/ui/Modal";
import { Select } from "../../components/ui/Select";
import { useClientes } from "../../hooks/useClientes";
import type { PedidoVendaCompleto } from "../../hooks/usePedidosVenda";
import { useProdutos } from "../../hooks/useProdutos";
import { formatCurrency } from "../../utils/formatters";
import styles from "./styles.module.css";

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
            setError("Adicione pelo menos um produto ao pedido de venda.");
            return;
        }

        const itensInvalidos = itens.some((i) => !i.produto_id || i.quantidade <= 0 || i.preco_unitario < 0);
        if (itensInvalidos) {
            setError("Verifique se todos os itens possuem produto selecionado e quantidade válida.");
            return;
        }

        for (const item of itens) {
            const prod = produtos.find((p) => p.id === item.produto_id);
            if (prod && prod.quantidade < item.quantidade) {
                setError(
                    `Atenção: Estoque insuficiente para "${prod.nome}". Disponível: ${prod.quantidade}, Solicitado: ${item.quantidade}.`,
                );
                return;
            }
        }

        setLoading(true);
        const res = await onSave(
            { cliente_id: clienteId, observacoes: observacoes.trim() || null, valor_total: valorTotal },
            itens,
            pedido?.id,
        );

        setLoading(false);
        if (res.success) {
            onClose();
        } else {
            setError(res.error || "Erro ao salvar pedido de venda.");
        }
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={pedido ? `Editar Venda #${pedido.numero || ""}` : "Novo Pedido de Venda"}
            width="large"
        >
            <form onSubmit={handleSubmit} className={styles.form_container}>
                {error && <div className="alert-error">{error}</div>}

                <div className={styles.grid2}>
                    <div>
                        <label className={styles.detalhe_label}>Cliente *</label>
                        <Select value={clienteId} onChange={(e) => setClienteId(e.target.value)}>
                            <option value="">Selecione um cliente...</option>
                            {clientes.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.nome} ({c.tipo_pessoa}
                                    {c.documento ? ` - ${c.documento}` : ""})
                                </option>
                            ))}
                        </Select>
                    </div>

                    <div>
                        <label className={styles.detalhe_label}>Observações</label>
                        <Input
                            placeholder="Ex: Entrega balcão, montagem de setup..."
                            value={observacoes}
                            onChange={(e) => setObservacoes(e.target.value)}
                        />
                    </div>
                </div>

                <div className={styles.itens_section}>
                    <div className={styles.itens_header}>
                        <h4 className={styles.modal_subtitle}>Produtos da Venda</h4>
                        <Button type="button" variant="secondary" onClick={handleAdicionarItem}>
                            <Plus size={16} className={styles.mr2} />
                            Adicionar Produto
                        </Button>
                    </div>

                    {itens.length === 0 ? (
                        <div className="empty-state" style={{ padding: "20px" }}>
                            Nenhum produto adicionado. Clique no botão acima para adicionar produtos.
                        </div>
                    ) : (
                        <div className={styles.itens_list}>
                            {itens.map((item, index) => (
                                <div key={index} className={styles.item_row}>
                                    <div>
                                        <label className={styles.detalhe_label}>Produto</label>
                                        <Select
                                            value={item.produto_id}
                                            onChange={(e) => handleItemChange(index, "produto_id", e.target.value)}
                                        >
                                            <option value="">Selecione um produto...</option>
                                            {produtos.map((p) => (
                                                <option key={p.id} value={p.id}>
                                                    {p.nome} (Estoque: {p.quantidade} un) - {formatCurrency(p.preco)}
                                                </option>
                                            ))}
                                        </Select>
                                    </div>

                                    <div>
                                        <label className={styles.detalhe_label}>Qtd</label>
                                        <Input
                                            type="number"
                                            min="1"
                                            value={item.quantidade}
                                            onChange={(e) => handleItemChange(index, "quantidade", e.target.value)}
                                        />
                                    </div>

                                    <div>
                                        <label className={styles.detalhe_label}>Preço Unitário (R$)</label>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={item.preco_unitario}
                                            onChange={(e) => handleItemChange(index, "preco_unitario", e.target.value)}
                                        />
                                    </div>

                                    <Button
                                        type="button"
                                        variant="ghost"
                                        onClick={() => handleRemoverItem(index)}
                                        style={{ color: "var(--color-danger-text)", height: "42px" }}
                                        title="Remover item"
                                    >
                                        <Trash2 size={16} />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className={styles.total_box}>
                    <span>Total da Venda:</span>
                    <span className={styles.total_value}>{formatCurrency(valorTotal)}</span>
                </div>

                <div className={styles.form_actions}>
                    <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
                        Cancelar
                    </Button>
                    <Button type="submit" disabled={loading}>
                        {loading ? "Salvando..." : pedido ? "Salvar Alterações" : "Criar Pedido de Venda"}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
