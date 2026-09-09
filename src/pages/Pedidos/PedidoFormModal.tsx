import { Plus, Trash2 } from "lucide-react";
import { useEffect, useState, type SubmitEvent } from "react";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Modal } from "../../components/ui/Modal";
import { Select } from "../../components/ui/Select";
import { useFornecedores } from "../../hooks/useFornecedores";
import type { PedidoCompleto } from "../../hooks/usePedidos";
import { useProdutos } from "../../hooks/useProdutos";
import { formatCurrency } from "../../utils/formatters";
import styles from "./styles.module.css";

interface ItemPedidoForm {
    produto_id: string;
    quantidade: number;
    preco_unitario: number;
}

interface PedidoFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    pedido?: PedidoCompleto | null;
    onSave: (
        pedidoData: {
            fornecedor_id: string;
            status: "rascunho" | "enviado" | "concluido" | "cancelado";
            valor_total: number;
        },
        itens: ItemPedidoForm[],
        pedidoId?: string,
    ) => Promise<{ success: boolean; error?: string }>;
}

export function PedidoFormModal({ isOpen, onClose, pedido, onSave }: PedidoFormModalProps) {
    const { fornecedores } = useFornecedores();
    const { produtos } = useProdutos();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [fornecedorId, setFornecedorId] = useState("");
    const [status, setStatus] = useState<"rascunho" | "enviado" | "concluido" | "cancelado">("rascunho");
    const [itens, setItens] = useState<ItemPedidoForm[]>([]);

    useEffect(() => {
        if (pedido) {
            setFornecedorId(pedido.fornecedor_id);
            setStatus(pedido.status);
            if (pedido.itens_pedido) {
                setItens(
                    pedido.itens_pedido.map((ip) => ({
                        produto_id: ip.produto_id,
                        quantidade: ip.quantidade,
                        preco_unitario: ip.preco_unitario,
                    })),
                );
            }
        } else {
            setFornecedorId("");
            setStatus("rascunho");
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

    function handleItemChange(index: number, field: keyof ItemPedidoForm, value: string | number) {
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

        if (!fornecedorId) {
            setError("Selecione um fornecedor.");
            return;
        }

        if (itens.length === 0) {
            setError("Adicione pelo menos um item ao pedido.");
            return;
        }

        const itensInvalidos = itens.some((i) => !i.produto_id || i.quantidade <= 0 || i.preco_unitario < 0);
        if (itensInvalidos) {
            setError("Verifique se todos os itens possuem produto selecionado e quantidade válida.");
            return;
        }

        setLoading(true);
        const res = await onSave({ fornecedor_id: fornecedorId, status, valor_total: valorTotal }, itens, pedido?.id);

        setLoading(false);
        if (res.success) {
            onClose();
        } else {
            setError(res.error || "Erro ao salvar o pedido.");
        }
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={pedido ? "Editar Pedido" : "Novo Pedido"} width="large">
            <form onSubmit={handleSubmit} className={styles.form_container}>
                {error && <div className="alert-error">{error}</div>}

                <div className={styles.grid2}>
                    <div>
                        <label className={styles.detalhe_label}>Fornecedor</label>
                        <Select value={fornecedorId} onChange={(e) => setFornecedorId(e.target.value)} required>
                            <option value="">Selecione um fornecedor</option>
                            {fornecedores.map((f) => (
                                <option key={f.id} value={f.id}>
                                    {f.razao_social}
                                </option>
                            ))}
                        </Select>
                    </div>
                    <div>
                        <label className={styles.detalhe_label}>Status</label>
                        <Select
                            value={status}
                            onChange={(e) =>
                                setStatus(e.target.value as "rascunho" | "enviado" | "concluido" | "cancelado")
                            }
                            required
                        >
                            <option value="rascunho">Rascunho</option>
                            <option value="enviado">Enviado</option>
                            <option value="concluido">Concluído</option>
                            <option value="cancelado">Cancelado</option>
                        </Select>
                    </div>
                </div>

                <div className={styles.mt8}>
                    <div className={styles.header}>
                        <h3 className={styles.modal_subtitle}>Itens do Pedido</h3>
                        <Button type="button" variant="secondary" onClick={handleAdicionarItem}>
                            <Plus size={16} className={styles.mr2} /> Adicionar Item
                        </Button>
                    </div>

                    {itens.length > 0 ? (
                        <div className="table-container">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Produto</th>
                                        <th>Qtd.</th>
                                        <th>Preço Un.</th>
                                        <th className="text-right">Subtotal</th>
                                        <th className="text-center">Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {itens.map((item, index) => (
                                        <tr key={index}>
                                            <td>
                                                <Select
                                                    value={item.produto_id}
                                                    onChange={(e) =>
                                                        handleItemChange(index, "produto_id", e.target.value)
                                                    }
                                                    required
                                                >
                                                    <option value="">Selecione o produto</option>
                                                    {produtos.map((p) => (
                                                        <option key={p.id} value={p.id}>
                                                            {p.nome}
                                                        </option>
                                                    ))}
                                                </Select>
                                            </td>
                                            <td className={styles.td_small}>
                                                <Input
                                                    type="number"
                                                    min="1"
                                                    value={item.quantidade}
                                                    onChange={(e) =>
                                                        handleItemChange(index, "quantidade", e.target.value)
                                                    }
                                                    required
                                                />
                                            </td>
                                            <td className={styles.td_medium}>
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    value={item.preco_unitario}
                                                    onChange={(e) =>
                                                        handleItemChange(index, "preco_unitario", e.target.value)
                                                    }
                                                    required
                                                />
                                            </td>
                                            <td className="text-right fw600">
                                                {formatCurrency(item.quantidade * item.preco_unitario)}
                                            </td>
                                            <td className="text-center">
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    onClick={() => handleRemoverItem(index)}
                                                >
                                                    <Trash2 size={16} className={styles.text_danger} />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="empty-state">Nenhum item adicionado ao pedido.</div>
                    )}
                </div>

                <div className={styles.form_actions_lg}>
                    <div className={styles.total_wrapper}>
                        <span className={styles.detalhe_label}>Valor Total:</span>
                        <span className={`text-right fw600 ${styles.total_valor}`}>{formatCurrency(valorTotal)}</span>
                    </div>
                    <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
                        Cancelar
                    </Button>
                    <Button type="submit" disabled={loading}>
                        {loading ? "Salvando..." : "Salvar Pedido"}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
