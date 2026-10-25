import { AlertCircle } from "lucide-react";
import { useEffect, useState, type ChangeEvent, type SubmitEvent } from "react";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Modal } from "../../components/ui/Modal";
import { Select } from "../../components/ui/Select";
import { useProdutos } from "../../hooks/useProdutos";
import type { Categoria, Produto } from "../../types";

interface ProdutoFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    produtoToEdit: Produto | null;
    categorias: Categoria[];
    onSuccess: () => void;
}

export function ProdutoFormModal({ isOpen, onClose, produtoToEdit, categorias, onSuccess }: ProdutoFormModalProps) {
    const { createProduto, updateProduto } = useProdutos();
    const isEditing = !!produtoToEdit;

    const [formData, setFormData] = useState({
        nome: "",
        sku: "",
        categoria_id: "",
        localizacao: "",
        quantidade: 0,
        estoque_minimo: 0,
        preco: 0,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (produtoToEdit) {
            setFormData({
                nome: produtoToEdit.nome,
                sku: produtoToEdit.sku,
                categoria_id: produtoToEdit.categoria_id || "",
                localizacao: produtoToEdit.localizacao || "",
                quantidade: produtoToEdit.quantidade,
                estoque_minimo: produtoToEdit.estoque_minimo,
                preco: produtoToEdit.preco,
            });
        } else {
            setFormData({
                nome: "",
                sku: "",
                categoria_id: "",
                localizacao: "",
                quantidade: 0,
                estoque_minimo: 0,
                preco: 0,
            });
        }
        setError("");
    }, [produtoToEdit, isOpen]);

    function handleChange(e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: ["quantidade", "estoque_minimo", "preco"].includes(name) ? Number(value) : value,
        }));
    }

    async function handleSubmit(e: SubmitEvent) {
        e.preventDefault();
        setLoading(true);
        setError("");

        const res = isEditing
            ? await updateProduto(produtoToEdit.id, {
                  nome: formData.nome,
                  sku: formData.sku,
                  categoria_id: formData.categoria_id || null,
                  localizacao: formData.localizacao,
                  estoque_minimo: formData.estoque_minimo,
                  preco: formData.preco,
              })
            : await createProduto({
                  nome: formData.nome,
                  sku: formData.sku,
                  categoria_id: formData.categoria_id || null,
                  localizacao: formData.localizacao,
                  quantidade: formData.quantidade,
                  estoque_minimo: formData.estoque_minimo,
                  preco: formData.preco,
              });

        if (res.success) {
            onSuccess();
        } else {
            setError(res.error || "Ocorreu um erro ao salvar o produto.");
        }

        setLoading(false);
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? "Editar Produto" : "Novo Produto"} width="large">
            <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                    <div className="p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-2 animate-fade-in">
                        <AlertCircle size={15} className="shrink-0 text-red-600" />
                        <span>{error}</span>
                    </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                        label="Nome do Produto"
                        name="nome"
                        placeholder="Ex: Teclado Mecânico USB"
                        value={formData.nome}
                        onChange={handleChange}
                        required
                    />
                    <Input
                        label="Código SKU"
                        name="sku"
                        placeholder="Ex: TEC-MEC-01"
                        value={formData.sku}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Select label="Categoria" name="categoria_id" value={formData.categoria_id} onChange={handleChange}>
                        <option value="">Selecione uma categoria...</option>
                        {categorias.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                                {cat.nome}
                            </option>
                        ))}
                    </Select>

                    <Input
                        label="Localização no Armazém"
                        name="localizacao"
                        placeholder="Ex: Corredor B, Prateleira 4"
                        value={formData.localizacao}
                        onChange={handleChange}
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Input
                        label="Qtd. Atual em Estoque"
                        name="quantidade"
                        type="number"
                        min="0"
                        value={formData.quantidade}
                        onChange={handleChange}
                        disabled={isEditing}
                        helperText={isEditing ? "Alterável apenas via movimentação" : undefined}
                    />
                    <Input
                        label="Estoque Mínimo"
                        name="estoque_minimo"
                        type="number"
                        min="0"
                        value={formData.estoque_minimo}
                        onChange={handleChange}
                        required
                    />
                    <Input
                        label="Preço Unitário (R$)"
                        name="preco"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.preco}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                    <Button type="button" variant="secondary" onClick={onClose}>
                        Cancelar
                    </Button>
                    <Button type="submit" variant="primary" disabled={loading}>
                        {loading ? "Salvando..." : isEditing ? "Salvar Alterações" : "Cadastrar Produto"}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
