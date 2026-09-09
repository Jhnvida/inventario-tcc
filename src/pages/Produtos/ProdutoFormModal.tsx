import { useEffect, useState, type ChangeEvent, type SubmitEvent } from "react";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Modal } from "../../components/ui/Modal";
import { Select } from "../../components/ui/Select";
import { useProdutos } from "../../hooks/useProdutos";
import type { Categoria, Produto } from "../../types";
import styles from "./styles.module.css";

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
            <form onSubmit={handleSubmit} className={styles.form_container}>
                {error && <div className="alert-error">{error}</div>}

                <div className={styles.grid2}>
                    <Input label="Nome do Produto" name="nome" value={formData.nome} onChange={handleChange} required />
                    <Input
                        label="SKU (Código Único)"
                        name="sku"
                        value={formData.sku}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className={styles.grid2}>
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
                        value={formData.localizacao}
                        onChange={handleChange}
                    />
                </div>

                <div className={styles.grid3}>
                    <Input
                        label="Qtd. Atual"
                        name="quantidade"
                        type="number"
                        min="0"
                        value={formData.quantidade}
                        onChange={handleChange}
                        disabled={isEditing}
                        title={isEditing ? "A quantidade só pode ser alterada via Movimentação ou Pedido" : ""}
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

                <div className={styles.form_actions}>
                    <Button type="button" variant="ghost" onClick={onClose}>
                        Cancelar
                    </Button>
                    <Button type="submit" variant="primary" disabled={loading}>
                        {loading ? "Salvando..." : "Salvar Produto"}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
