import { useEffect, useState } from "react";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Modal } from "../../components/ui/Modal";
import { Select } from "../../components/ui/Select";
import { supabase } from "../../lib/supabase";
import type { Categoria, Produto } from "../../types";

interface ProdutoFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    produtoToEdit: Produto | null;
    categorias: Categoria[];
    onSuccess: () => void;
}

export function ProdutoFormModal({ isOpen, onClose, produtoToEdit, categorias, onSuccess }: ProdutoFormModalProps) {
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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: ["quantidade", "estoque_minimo", "preco"].includes(name) ? Number(value) : value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            if (isEditing) {
                // Edição - saldo físico não pode ser alterado por aqui
                const { error: updateError } = await supabase
                    .from("produtos")
                    .update({
                        nome: formData.nome,
                        sku: formData.sku,
                        categoria_id: formData.categoria_id || null,
                        localizacao: formData.localizacao,
                        estoque_minimo: formData.estoque_minimo,
                        preco: formData.preco,
                        atualizado_em: new Date().toISOString(),
                    })
                    .eq("id", produtoToEdit.id);

                if (updateError) throw updateError;
            } else {
                // Cadastro novo
                const { data: newProd, error: insertError } = await supabase
                    .from("produtos")
                    .insert([
                        {
                            nome: formData.nome,
                            sku: formData.sku,
                            categoria_id: formData.categoria_id || null,
                            localizacao: formData.localizacao,
                            quantidade: formData.quantidade,
                            estoque_minimo: formData.estoque_minimo,
                            preco: formData.preco,
                        },
                    ])
                    .select("id")
                    .single();

                if (insertError) throw insertError;

                // Se houver saldo inicial, dispara a movimentação
                if (newProd && formData.quantidade > 0) {
                    const { error: movError } = await supabase.rpc("registrar_movimentacao", {
                        p_produto_id: newProd.id,
                        p_tipo: "entrada",
                        p_quantidade: formData.quantidade,
                        p_responsavel: "Administrador",
                        p_motivo: "Saldo inicial de cadastro",
                    });

                    // Em caso de erro na movimentação (ex: trigger failed), ignoramos aqui pois o produto foi criado
                    // Idealmente seria tudo numa transação, mas o Supabase RPC requer ser chamado de fora
                    if (movError) console.error("Erro ao registrar mov inicial:", movError);
                }
            }
            onSuccess();
        } catch (err: any) {
            setError(err.message || "Ocorreu um erro ao salvar o produto.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? "Editar Produto" : "Novo Produto"} width="large">
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                {error && (
                    <div
                        style={{
                            padding: "1rem",
                            backgroundColor: "var(--status-critical-bg)",
                            color: "var(--status-critical-text)",
                            borderRadius: "8px",
                        }}
                    >
                        {error}
                    </div>
                )}

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    <Input label="Nome do Produto" name="nome" value={formData.nome} onChange={handleChange} required />
                    <Input
                        label="SKU (Código Único)"
                        name="sku"
                        value={formData.sku}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
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

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
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

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem", marginTop: "1rem" }}>
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
