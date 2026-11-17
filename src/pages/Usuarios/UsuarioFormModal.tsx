import { useEffect, useState, type SubmitEvent } from "react";
import { Alert } from "../../components/ui/Alert";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Modal } from "../../components/ui/Modal";
import { useUsuarios, type Usuario } from "../../hooks/useUsuarios";

interface UsuarioFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    usuarioToEdit: Usuario | null;
    onSuccess: () => void;
}

export function UsuarioFormModal({ isOpen, onClose, usuarioToEdit, onSuccess }: UsuarioFormModalProps) {
    const { updateUsuario } = useUsuarios();

    const [nome, setNome] = useState("");
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (usuarioToEdit) {
            setNome(usuarioToEdit.nome);
            setEmail(usuarioToEdit.email);
        } else {
            setNome("");
            setEmail("");
        }
        setError("");
    }, [usuarioToEdit, isOpen]);

    async function handleSubmit(e: SubmitEvent) {
        e.preventDefault();
        if (!usuarioToEdit) return;

        const nomeTrimmed = nome.trim();
        if (!nomeTrimmed) {
            setError("O nome do operador é obrigatório.");
            return;
        }

        setLoading(true);
        setError("");

        const res = await updateUsuario(usuarioToEdit.id, { nome: nomeTrimmed });

        if (res.success) {
            onSuccess();
        } else {
            setError(res.error || "Erro ao atualizar operador.");
        }

        setLoading(false);
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Editar Operador"
            subtitle="Atualize os dados de identificação cadastral do usuário no sistema"
            width="small"
        >
            <form onSubmit={handleSubmit} className="space-y-5">
                {error && <Alert variant="error">{error}</Alert>}

                <Input
                    label="Nome Completo"
                    placeholder="Ex: Ana Clara Souza"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    required
                    autoFocus
                />

                <Input
                    label="E-mail de Acesso"
                    value={email}
                    disabled
                    readOnly
                    helperText="O e-mail está associado à credencial de acesso do Supabase e não pode ser editado."
                />

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                    <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
                        Cancelar
                    </Button>
                    <Button type="submit" variant="primary" disabled={loading}>
                        {loading ? "Salvando..." : "Salvar Alterações"}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
