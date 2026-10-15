import { AlertCircle, Edit2, Trash2, UserCog } from "lucide-react";
import { useState, type SubmitEvent } from "react";
import { Button } from "../../components/ui/Button";
import { EmptyState } from "../../components/ui/EmptyState";
import { Input } from "../../components/ui/Input";
import { Modal } from "../../components/ui/Modal";
import { PageHeader } from "../../components/ui/PageHeader";
import { Pagination } from "../../components/ui/Pagination";
import { Skeleton } from "../../components/ui/Skeleton";
import { useUsuarios, type Usuario } from "../../hooks/useUsuarios";

export function Usuarios() {
    const {
        usuarios,
        totalUsuarios,
        pagina,
        setPagina,
        totalPaginas,
        itensPorPagina,
        loading,
        updateUsuario,
        deleteUsuario,
    } = useUsuarios();

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
        <div className="space-y-6">
            <PageHeader
                title="Gestão de Usuários"
                subtitle="Controle de operadores, administradores e dados de acesso ao sistema."
            />

            <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                {loading ? (
                    <div className="p-6 space-y-3">
                        <Skeleton className="w-full h-10" />
                        <Skeleton className="w-full h-10" />
                        <Skeleton className="w-full h-10" />
                    </div>
                ) : usuarios.length === 0 ? (
                    <EmptyState
                        icon={UserCog}
                        title="Nenhum usuário localizado"
                        description="Os usuários são criados a partir do serviço de autenticação do Supabase."
                    />
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-slate-50/50 border-b border-slate-200 text-slate-600 font-medium">
                                    <tr>
                                        <th className="px-4 py-3">Operador & Identificação</th>
                                        <th className="px-4 py-3">E-mail de Acesso</th>
                                        <th className="px-4 py-3 text-right">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {usuarios.map((user) => {
                                        const initials = user.nome
                                            .split(" ")
                                            .map((n) => n[0])
                                            .slice(0, 2)
                                            .join("")
                                            .toUpperCase();
                                        return (
                                            <tr key={user.id} className="hover:bg-slate-50/60 transition-colors">
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-medium text-xs flex items-center justify-center shrink-0">
                                                            {initials || "U"}
                                                        </div>
                                                        <div>
                                                            <div className="font-medium text-slate-900">
                                                                {user.nome}
                                                            </div>
                                                            <span className="font-mono text-[11px] text-slate-400">
                                                                ID: {user.id.substring(0, 8)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-slate-600">{user.email}</td>
                                                <td className="px-4 py-3 text-right">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <button
                                                            type="button"
                                                            className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                                                            onClick={() => handleOpenEdit(user)}
                                                            title="Editar nome do operador"
                                                        >
                                                            <Edit2 size={16} />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="p-1.5 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                                                            onClick={() => handleDelete(user.id, user.nome)}
                                                            title="Excluir operador"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        <Pagination
                            currentPage={pagina}
                            totalPages={totalPaginas}
                            totalItems={totalUsuarios}
                            pageSize={itensPorPagina}
                            onPageChange={setPagina}
                            itemName="usuários"
                        />
                    </>
                )}
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Editar Nome do Operador"
                width="small"
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-2">
                            <AlertCircle size={15} className="shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    <Input
                        label="Nome Completo"
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                        required
                        autoFocus
                    />

                    <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200">
                        <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" variant="primary" disabled={isSubmitting}>
                            {isSubmitting ? "Salvando..." : "Atualizar Nome"}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
