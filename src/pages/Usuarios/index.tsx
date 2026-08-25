import { Edit2 } from "lucide-react";
import { useState } from "react";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Modal } from "../../components/ui/Modal";
import { PageHeader } from "../../components/ui/PageHeader";
import { Select } from "../../components/ui/Select";
import { useUsuarios, type Usuario } from "../../hooks/useUsuarios";
import styles from "./styles.module.css";

export function Usuarios() {
    const { usuarios, loading, updateUsuario } = useUsuarios();

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<Usuario | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form state
    const [nome, setNome] = useState("");
    const [perfil, setPerfil] = useState<"admin" | "operador">("operador");
    const [ativo, setAtivo] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const handleEdit = (user: Usuario) => {
        setSelectedUser(user);
        setNome(user.nome);
        setPerfil(user.perfil);
        setAtivo(user.ativo);
        setError(null);
        setIsModalOpen(true);
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUser) return;

        setIsSubmitting(true);
        setError(null);

        if (!nome.trim()) {
            setError("O nome é obrigatório.");
            setIsSubmitting(false);
            return;
        }

        const res = await updateUsuario(selectedUser.id, { nome: nome.trim(), perfil, ativo });

        if (res.success) {
            setIsModalOpen(false);
        } else {
            setError("Erro ao atualizar usuário.");
        }

        setIsSubmitting(false);
    };

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
                                <th>Nome</th>
                                <th>Email</th>
                                <th>Perfil</th>
                                <th>Status</th>
                                <th>Data de Cadastro</th>
                                <th style={{ textAlign: "right" }}>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {usuarios.map((user) => (
                                <tr key={user.id}>
                                    <td className="fw500">{user.nome}</td>
                                    <td>{user.email}</td>
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
                                    <td>{new Date(user.criado_em).toLocaleDateString()}</td>
                                    <td style={{ textAlign: "right" }}>
                                        <button
                                            className={styles.action_btn}
                                            onClick={() => handleEdit(user)}
                                            title="Editar Acessos"
                                        >
                                            <Edit2 size={18} className={styles.edit_icon} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
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
                            <option value="operador">Operador (Acesso Padrão)</option>
                            <option value="admin">Administrador (Acesso Total)</option>
                        </Select>

                        <Select
                            label="Status"
                            value={ativo ? "true" : "false"}
                            onChange={(e) => setAtivo(e.target.value === "true")}
                            disabled={isSubmitting}
                        >
                            <option value="true">Ativo (Permitir Acesso)</option>
                            <option value="false">Inativo (Bloquear Acesso)</option>
                        </Select>

                        {error && <span className={styles.error_message}>{error}</span>}

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
