import { Edit2, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { useState, type SubmitEvent } from "react";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Modal } from "../../components/ui/Modal";
import { PageHeader } from "../../components/ui/PageHeader";
import { useUsuarios, type Usuario } from "../../hooks/useUsuarios";
import styles from "./styles.module.css";

export function Usuarios() {
    const { usuarios, loading, updateUsuario, deleteUsuario } = useUsuarios();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<Usuario | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [nome, setNome] = useState("");
    const [error, setError] = useState<string | null>(null);

    function handleOpenEdit(user: Usuario) {
        setSelectedUser(user);
        setNome(user.nome);
        setError(null);
        setIsModalOpen(true);
    }

    async function handleDelete(id: string, nome: string) {
        if (!window.confirm(`Tem certeza que deseja excluir o usuário "${nome}"? Essa ação é irreversível.`)) return;

        const res = await deleteUsuario(id);
        if (!res.success) {
            alert("Erro ao excluir usuário. Ele pode estar vinculado a registros no banco.");
        }
    }

    async function handleSubmit(e: SubmitEvent) {
        e.preventDefault();
        if (!selectedUser) return;
        if (!nome.trim()) {
            setError("O nome é obrigatório.");
            return;
        }

        setIsSubmitting(true);
        setError(null);

        const res = await updateUsuario(selectedUser.id, { nome: nome.trim() });

        if (res.success) {
            setIsModalOpen(false);
        } else {
            setError("Erro ao atualizar usuário.");
        }

        setIsSubmitting(false);
    }

    return (
        <div className="page-container">
            <PageHeader title="Gestão de Usuários" subtitle="Gerencie as informações dos usuários do sistema." />

            <div className="table-container">
                {loading ? (
                    <div className="loading-state">Carregando usuários...</div>
                ) : usuarios.length === 0 ? (
                    <div className="empty-state">Nenhum usuário encontrado.</div>
                ) : (
                    <>
                        <table className="data-table hidden-mobile">
                            <thead>
                                <tr>
                                    <th>Usuário</th>
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
                                {usuarios.map((user) => (
                                    <motion.tr
                                        key={user.id}
                                        variants={{
                                            hidden: { opacity: 0, x: -10 },
                                            visible: { opacity: 1, x: 0 },
                                        }}
                                    >
                                        <td>
                                            <div className="fw500">{user.nome}</div>
                                            <div className="text-secondary" style={{ fontSize: "0.85em" }}>
                                                {user.email}
                                            </div>
                                        </td>
                                        <td style={{ textAlign: "right" }}>
                                            <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                                                <Button
                                                    variant="ghost"
                                                    onClick={() => handleOpenEdit(user)}
                                                    title="Editar Usuário"
                                                >
                                                    <Edit2 size={16} />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    onClick={() => handleDelete(user.id, user.nome)}
                                                    title="Excluir Usuário"
                                                    style={{ color: "var(--color-danger-text)" }}
                                                >
                                                    <Trash2 size={16} />
                                                </Button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </motion.tbody>
                        </table>

                        <div className="mobile-cards-list mobile-only">
                            {usuarios.map((user) => (
                                <div key={user.id} className="mobile-card">
                                    <div className="mobile-card-header">
                                        <div>
                                            <div className="mobile-card-title">{user.nome}</div>
                                            <div className="mobile-card-subtitle">{user.email}</div>
                                        </div>
                                    </div>
                                    <div className="mobile-card-actions">
                                        <Button
                                            variant="ghost"
                                            onClick={() => handleOpenEdit(user)}
                                            title="Editar Usuário"
                                        >
                                            <Edit2 size={16} />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            onClick={() => handleDelete(user.id, user.nome)}
                                            title="Excluir Usuário"
                                            style={{ color: "var(--color-danger-text)" }}
                                        >
                                            <Trash2 size={16} />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => !isSubmitting && setIsModalOpen(false)}
                title="Editar Usuário"
                width="small"
            >
                {selectedUser && (
                    <form onSubmit={handleSubmit} className={styles.form}>
                        <div className={styles.user_details}>
                            <p>
                                <strong>Email:</strong> {selectedUser.email}
                            </p>
                        </div>

                        <Input
                            label="Nome"
                            value={nome}
                            onChange={(e) => setNome(e.target.value)}
                            disabled={isSubmitting}
                            autoFocus
                        />

                        {error && <div className="alert-error">{error}</div>}

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
                                {isSubmitting ? "Salvando..." : "Salvar Alterações"}
                            </Button>
                        </div>
                    </form>
                )}
            </Modal>
        </div>
    );
}
