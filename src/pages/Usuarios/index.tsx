import { Edit2, Search, Trash2, UserCog, X } from "lucide-react";
import { useState } from "react";
import { Avatar } from "../../components/ui/Avatar";
import { Badge } from "../../components/ui/Badge";
import { Button, IconButton } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { EmptyState } from "../../components/ui/EmptyState";
import { Input } from "../../components/ui/Input";
import { PageHeader } from "../../components/ui/PageHeader";
import { Pagination } from "../../components/ui/Pagination";
import { Skeleton } from "../../components/ui/Skeleton";
import { useAuth } from "../../contexts/AuthContext";
import { useUsuarios, type Usuario } from "../../hooks/useUsuarios";
import { formatDate } from "../../utils/formatters";
import { UsuarioFormModal } from "./UsuarioFormModal";

export function Usuarios() {
    const {
        usuarios,
        totalUsuarios,
        pagina,
        setPagina,
        totalPaginas,
        itensPorPagina,
        loading,
        busca,
        setBusca,
        recarregar,
        deleteUsuario,
    } = useUsuarios();

    const { user: currentUser } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [userToEdit, setUserToEdit] = useState<Usuario | null>(null);

    function handleOpenEdit(user: Usuario) {
        setUserToEdit(user);
        setIsModalOpen(true);
    }

    function handleSuccess() {
        setIsModalOpen(false);
        recarregar();
    }

    async function handleDelete(user: Usuario) {
        if (currentUser && currentUser.id === user.id) {
            alert("Operação não permitida: você não pode excluir o seu próprio usuário conectado ao sistema.");
            return;
        }

        if (!window.confirm(`Tem certeza que deseja excluir o usuário "${user.nome}"? Essa ação é irreversível.`)) {
            return;
        }

        const res = await deleteUsuario(user.id);
        if (!res.success) {
            alert(res.error || "Erro ao excluir operador.");
        }
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title="Gestão de Usuários"
                subtitle="Controle de operadores, administradores e dados de acesso ao sistema."
            />

            <Card padding="small" className="flex items-center gap-3">
                <div className="flex-1 w-full">
                    <Input
                        startIcon={<Search size={15} />}
                        placeholder="Buscar por operador ou e-mail..."
                        value={busca}
                        onChange={(e) => setBusca(e.target.value)}
                        endIcon={
                            busca ? (
                                <button
                                    type="button"
                                    onClick={() => setBusca("")}
                                    className="p-1 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                                    title="Limpar busca"
                                    aria-label="Limpar busca"
                                >
                                    <X size={14} />
                                </button>
                            ) : undefined
                        }
                    />
                </div>
            </Card>

            <Card padding="none" className="overflow-hidden">
                {loading ? (
                    <div className="p-6 space-y-3">
                        <Skeleton className="w-full h-9" />
                        <Skeleton className="w-full h-9" />
                        <Skeleton className="w-full h-9" />
                    </div>
                ) : usuarios.length === 0 ? (
                    <EmptyState
                        icon={UserCog}
                        title={busca ? "Nenhum usuário encontrado" : "Nenhum usuário localizado"}
                        description={
                            busca
                                ? "Tente alterar os termos de pesquisa para localizar o operador."
                                : "Os usuários são provisionados a partir do serviço de autenticação do Supabase."
                        }
                        border="none"
                        action={
                            busca ? (
                                <Button variant="secondary" size="sm" onClick={() => setBusca("")}>
                                    <span>Limpar busca</span>
                                </Button>
                            ) : undefined
                        }
                    />
                ) : (
                    <>
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-left text-xs border-collapse">
                                <thead className="bg-slate-50/50 border-b border-slate-200 text-slate-600 font-medium">
                                    <tr>
                                        <th className="px-5 py-2.5">Operador & Identificação</th>
                                        <th className="px-5 py-2.5">E-mail de Acesso</th>
                                        <th className="px-5 py-2.5">Data de Cadastro</th>
                                        <th className="px-5 py-2.5 text-center">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {usuarios.map((user) => {
                                        const isCurrent = currentUser?.id === user.id;
                                        return (
                                            <tr
                                                key={user.id}
                                                className="hover:bg-slate-50/75 transition-colors duration-150 ease-out"
                                            >
                                                <td className="px-5 py-3">
                                                    <div className="flex items-center gap-2.5">
                                                        <Avatar name={user.nome} size="sm" />
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-medium text-slate-900">{user.nome}</span>
                                                                {isCurrent && <Badge variant="primary">Você</Badge>}
                                                            </div>
                                                            <span className="font-mono text-[11px] text-slate-400">
                                                                ID: {user.id.substring(0, 8)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-3 text-slate-600">{user.email}</td>
                                                <td className="px-5 py-3 text-slate-500 font-medium tabular-nums">
                                                    {formatDate(user.criado_em)}
                                                </td>
                                                <td className="px-5 py-3 text-center">
                                                    <div className="flex items-center justify-center gap-1">
                                                        <IconButton
                                                            title="Editar operador"
                                                            aria-label={`Editar ${user.nome}`}
                                                            onClick={() => handleOpenEdit(user)}
                                                        >
                                                            <Edit2 size={15} />
                                                        </IconButton>
                                                        <IconButton
                                                            variant="danger"
                                                            title={
                                                                isCurrent
                                                                    ? "Você não pode excluir o seu próprio usuário"
                                                                    : "Excluir operador"
                                                            }
                                                            aria-label={`Excluir ${user.nome}`}
                                                            disabled={isCurrent}
                                                            onClick={() => handleDelete(user)}
                                                        >
                                                            <Trash2 size={15} />
                                                        </IconButton>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        <div className="md:hidden divide-y divide-slate-100">
                            {usuarios.map((user) => {
                                const isCurrent = currentUser?.id === user.id;
                                return (
                                    <div key={user.id} className="p-4 space-y-3">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex items-center gap-2.5 min-w-0">
                                                <Avatar name={user.nome} size="sm" />
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="font-medium text-slate-900 text-sm truncate">
                                                            {user.nome}
                                                        </h4>
                                                        {isCurrent && <Badge variant="primary">Você</Badge>}
                                                    </div>
                                                    <span className="text-xs text-slate-500 block truncate">
                                                        {user.email}
                                                    </span>
                                                </div>
                                            </div>
                                            <span className="font-mono text-[11px] text-slate-400 shrink-0">
                                                ID: {user.id.substring(0, 8)}
                                            </span>
                                        </div>

                                        {user.criado_em && (
                                            <div className="text-xs text-slate-400">
                                                Cadastrado em:{" "}
                                                <span className="text-slate-600 font-medium">
                                                    {formatDate(user.criado_em)}
                                                </span>
                                            </div>
                                        )}

                                        <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100">
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                onClick={() => handleOpenEdit(user)}
                                            >
                                                <Edit2 size={14} />
                                                <span>Editar</span>
                                            </Button>
                                            <Button
                                                variant="danger"
                                                size="sm"
                                                disabled={isCurrent}
                                                title={
                                                    isCurrent
                                                        ? "Você não pode excluir o seu próprio usuário"
                                                        : "Excluir operador"
                                                }
                                                onClick={() => handleDelete(user)}
                                            >
                                                <Trash2 size={14} />
                                                <span>Excluir</span>
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })}
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
            </Card>

            <UsuarioFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                usuarioToEdit={userToEdit}
                onSuccess={handleSuccess}
            />
        </div>
    );
}
