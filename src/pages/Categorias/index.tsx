import { Edit2, Plus, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { useState, type SubmitEvent } from "react";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Modal } from "../../components/ui/Modal";
import { PageHeader } from "../../components/ui/PageHeader";
import { useCategorias } from "../../hooks/useCategorias";
import styles from "./styles.module.css";

export function Categorias() {
    const { categorias, loading, deleteCategoria, createCategoria, updateCategoria } = useCategorias();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [categoriaEditando, setCategoriaEditando] = useState<{ id: string; nome: string } | null>(null);
    const [novaCategoria, setNovaCategoria] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSave = async (e: SubmitEvent) => {
        e.preventDefault();
        if (!novaCategoria.trim()) {
            setError("O nome da categoria é obrigatório.");
            return;
        }

        setIsSubmitting(true);
        setError(null);

        let res;
        if (categoriaEditando) {
            res = await updateCategoria(categoriaEditando.id, novaCategoria.trim());
        } else {
            res = await createCategoria(novaCategoria.trim());
        }

        if (res.success) {
            setIsModalOpen(false);
            setNovaCategoria("");
            setCategoriaEditando(null);
        } else {
            setError(
                categoriaEditando
                    ? "Erro ao atualizar categoria."
                    : "Erro ao criar categoria. Verifique se já não existe uma com este nome.",
            );
        }

        setIsSubmitting(false);
    };

    const handleDelete = async (id: string, nome: string) => {
        if (
            !window.confirm(
                `Tem certeza que deseja excluir a categoria "${nome}"? Produtos vinculados perderão a categoria.`,
            )
        ) {
            return;
        }

        const res = await deleteCategoria(id);
        if (!res.success) {
            alert("Erro ao excluir categoria.");
        }
    };

    return (
        <div className="page-container">
            <PageHeader title="Categorias" subtitle="Gerencie as categorias de produtos do sistema.">
                <Button
                    onClick={() => {
                        setCategoriaEditando(null);
                        setIsModalOpen(true);
                        setError(null);
                        setNovaCategoria("");
                    }}
                >
                    <Plus size={18} style={{ marginRight: 8 }} />
                    Nova Categoria
                </Button>
            </PageHeader>

            <div className="table-container">
                {loading ? (
                    <div className="loading-state">Carregando categorias...</div>
                ) : categorias.length === 0 ? (
                    <div className="empty-state">Nenhuma categoria encontrada.</div>
                ) : (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Nome</th>
                                <th>Data de Criação</th>
                                <th style={{ textAlign: "right" }}>Ações</th>
                            </tr>
                        </thead>
                        <motion.tbody
                            initial="hidden"
                            animate="visible"
                            variants={{
                                hidden: { opacity: 0 },
                                visible: {
                                    opacity: 1,
                                    transition: { staggerChildren: 0.05 },
                                },
                            }}
                        >
                            {categorias.map((cat) => (
                                <motion.tr
                                    key={cat.id}
                                    variants={{
                                        hidden: { opacity: 0, x: -10 },
                                        visible: { opacity: 1, x: 0 },
                                    }}
                                >
                                    <td className="fw500">{cat.nome}</td>
                                    <td>{new Date(cat.criado_em).toLocaleDateString()}</td>
                                    <td style={{ textAlign: "right" }}>
                                        <button
                                            className={styles.action_btn}
                                            onClick={() => {
                                                setCategoriaEditando({ id: cat.id, nome: cat.nome });
                                                setNovaCategoria(cat.nome);
                                                setIsModalOpen(true);
                                                setError(null);
                                            }}
                                            title="Editar"
                                        >
                                            <Edit2 size={18} className={styles.edit_icon} />
                                        </button>
                                        <button
                                            className={styles.action_btn}
                                            onClick={() => handleDelete(cat.id, cat.nome)}
                                            title="Excluir"
                                        >
                                            <Trash2 size={18} className={styles.danger_icon} />
                                        </button>
                                    </td>
                                </motion.tr>
                            ))}
                        </motion.tbody>
                    </table>
                )}
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => !isSubmitting && setIsModalOpen(false)}
                title={categoriaEditando ? "Editar Categoria" : "Nova Categoria"}
                width="small"
            >
                <form onSubmit={handleSave} className={styles.form}>
                    <Input
                        label="Nome da Categoria"
                        value={novaCategoria}
                        onChange={(e) => setNovaCategoria(e.target.value)}
                        placeholder="Ex: Eletrônicos"
                        disabled={isSubmitting}
                        error={error || undefined}
                        autoFocus
                    />

                    <div className={styles.form_actions}>
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setIsModalOpen(false)}
                            disabled={isSubmitting}
                        >
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Salvando..." : "Salvar"}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
