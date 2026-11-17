import { useEffect, useState, type SubmitEvent } from "react";
import { Alert } from "../../components/ui/Alert";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Modal } from "../../components/ui/Modal";
import { useCategorias } from "../../hooks/useCategorias";
import type { Categoria } from "../../types";

interface CategoriaFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    categoriaToEdit: Categoria | null;
    onSuccess: () => void;
}

export function CategoriaFormModal({ isOpen, onClose, categoriaToEdit, onSuccess }: CategoriaFormModalProps) {
    const { createCategoria, updateCategoria } = useCategorias();
    const isEditing = !!categoriaToEdit;

    const [nome, setNome] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (categoriaToEdit) {
            setNome(categoriaToEdit.nome);
        } else {
            setNome("");
        }
        setError("");
    }, [categoriaToEdit, isOpen]);

    async function handleSubmit(e: SubmitEvent) {
        e.preventDefault();
        const nomeTrimmed = nome.trim();
        if (!nomeTrimmed) {
            setError("O nome da categoria é obrigatório.");
            return;
        }

        setLoading(true);
        setError("");

        const res = categoriaToEdit
            ? await updateCategoria(categoriaToEdit.id, nomeTrimmed)
            : await createCategoria(nomeTrimmed);

        if (res.success) {
            onSuccess();
        } else {
            setError(res.error || "Erro ao salvar categoria.");
        }

        setLoading(false);
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={isEditing ? "Editar Categoria" : "Nova Categoria"}
            subtitle="Agrupamento taxonômico de produtos no catálogo"
            width="small"
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                {error && <Alert variant="error">{error}</Alert>}

                <Input
                    label="Nome da Categoria"
                    placeholder="Ex: Cabos e Conectores"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    required
                    autoFocus
                />

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                    <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
                        Cancelar
                    </Button>
                    <Button type="submit" variant="primary" disabled={loading}>
                        {loading ? "Salvando..." : isEditing ? "Salvar Alterações" : "Criar Categoria"}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
