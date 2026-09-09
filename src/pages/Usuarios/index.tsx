import { Edit2, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { useState, type SubmitEvent } from "react";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Modal } from "../../components/ui/Modal";
import { PageHeader } from "../../components/ui/PageHeader";
import { Select } from "../../components/ui/Select";
import { useUsuarios, type Usuario } from "../../hooks/useUsuarios";
import styles from "./styles.module.css";

export function Usuarios() {
    const { usuarios, loading, updateUsuario, deleteUsuario } = useUsuarios();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<Usuario | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [nome, setNome] = useState("");
    const [perfil, setPerfil] = useState<"admin" | "operador">("operador");
    const [ativo, setAtivo] = useState(true);
    const [error, setError] = useState<string | null>(null);

    function handleEdit(user: Usuario) {
        setSelectedUser(user);
        setNome(user.nome);
        setPerfil(user.perfil);
        setAtivo(user.ativo);
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

    async function handleUpdate(e: SubmitEvent) {
        e.preventDefault();
        if (!selectedUser) return;
        if (!nome.trim()) {
            setError("O nome é obrigatório.");
            return;
        }

        setIsSubmitting(true);
        setError(null);

        const res = await updateUsuario(selectedUser.id, { nome: nome.trim(), perfil, ativo });

        if (res.success) {
            setIsModalOpen(false);
        } else {
            setError("Erro ao atualizar usuário.");
        }

        setIsSubmitting(false);
    }

    return (
        <div className="page-container">
            <PageHeader title="Gestão de Usuários" subtitle="Gerencie os usuários e os níveis de acesso do sistema." />

            <div className="table-container">
                {loading ? (
                    <div className="loading-state">Carregando usuários...</div>
                ) : usuarios.length === 0 ? (
                    <div className="empty-state">Nenhum usuário encontrado.</div>
                ) : (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Usuário</th>
                                <th>Perfil</th>
                                <th>Status</th>
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
                                    <td>
                                        <Badge variant={user.perfil === "admin" ? "critical" : "neutral"}>
                                            {user.perfil === "admin" ? "Administrador" : "Operador"}
                                        </Badge>
                                    </td>
                                    <td>
                                        <Badge variant={user.ativo ? "success" : "neutral"}>
                                            {user.ativo ? "Ativo" : "Inativo"}
                                        </Badge>
                                    </td>
                                    <td style={{ textAlign: "right" }}>
                                        <button
                                            className={styles.action_btn}
                                            onClick={() => handleEdit(user)}
                                            title="Editar Acessos"
                                        >
                                            <Edit2 size={18} className={styles.edit_icon} />
                                        </button>
                                        <button
                                            className={styles.action_btn}
                                            onClick={() => handleDelete(user.id, user.nome)}
                                            title="Excluir Usuário"
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
                title="Editar Usuário"
                width="small"
            >
                {selectedUser && (
                    <form onSubmit={handleUpdate} className={styles.form}>
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

                        <Select
                            label="Nível de Acesso (Perfil)"
                            value={perfil}
                            onChange={(e) => setPerfil(e.target.value as "admin" | "operador")}
                            disabled={isSubmitting}
                        >
                            <option value="operador">Operador</option>
                            <option value="admin">Administrador</option>
                        </Select>

                        <Select
                            label="Status"
                            value={ativo ? "true" : "false"}
                            onChange={(e) => setAtivo(e.target.value === "true")}
                            disabled={isSubmitting}
                        >
                            <option value="true">Ativo</option>
                            <option value="false">Inativo</option>
                        </Select>

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
