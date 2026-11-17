import {
    Ban,
    Check,
    Clock,
    Edit2,
    RotateCcw,
    Search,
    Trash2,
    UserCog,
    X,
} from "lucide-react";
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
import { useUsuarios, type FiltroStatusUsuario, type Usuario } from "../../hooks/useUsuarios";
import { formatDate } from "../../utils/formatters";
import { UsuarioFormModal } from "./UsuarioFormModal";

export function Usuarios() {
    const {
        usuarios,
        totalUsuarios,
        totalPendentes,
        pagina,
        setPagina,
        totalPaginas,
        itensPorPagina,
        loading,
        busca,
        setBusca,
        filtroStatus,
        setFiltroStatus,
        recarregar,
        aprovarUsuario,
        recusarUsuario,
        inativarUsuario,
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

    async function handleAprovar(user: Usuario) {
        if (!window.confirm(`Deseja aprovar o cadastro de "${user.nome}"? O acesso ao sistema será liberado imediatamente.`)) {
            return;
        }

        const res = await aprovarUsuario(user.id);
        if (!res.success) {
            alert(res.error || "Erro ao aprovar operador.");
        }
    }

    async function handleRecusar(user: Usuario) {
        if (currentUser && currentUser.id === user.id) {
            alert("Operação não permitida: você não pode recusar seu próprio usuário.");
            return;
        }

        if (!window.confirm(`Deseja recusar a solicitação de acesso de "${user.nome}"?`)) {
            return;
        }

        const res = await recusarUsuario(user.id);
        if (!res.success) {
            alert(res.error || "Erro ao recusar operador.");
        }
    }

    async function handleInativar(user: Usuario) {
        if (currentUser && currentUser.id === user.id) {
            alert("Operação não permitida: você não pode desativar seu próprio usuário conectado.");
            return;
        }

        if (!window.confirm(`Tem certeza que deseja inativar o acesso de "${user.nome}"? O usuário será impedido de acessar o sistema.`)) {
            return;
        }

        const res = await inativarUsuario(user.id);
        if (!res.success) {
            alert(res.error || "Erro ao inativar operador.");
        }
    }

    async function handleDelete(user: Usuario) {
        if (currentUser && currentUser.id === user.id) {
            alert("Operação não permitida: você não pode excluir o seu próprio usuário conectado ao sistema.");
            return;
        }

        if (!window.confirm(`Tem certeza que deseja excluir permanentemente o cadastro de "${user.nome}"? Essa ação é irreversível.`)) {
            return;
        }

        const res = await deleteUsuario(user.id);
        if (!res.success) {
            alert(res.error || "Erro ao excluir operador.");
        }
    }

    function renderStatusBadge(status: Usuario["status"]) {
        switch (status) {
            case "ativo":
                return <Badge variant="success" dot>Ativo</Badge>;
            case "pendente":
                return <Badge variant="warning" dot>Pendente</Badge>;
            case "recusado":
                return <Badge variant="critical" dot>Recusado</Badge>;
            case "inativo":
                return <Badge variant="neutral" dot>Inativo</Badge>;
            default:
                return <Badge variant="neutral">{status}</Badge>;
        }
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title="Gestão de Usuários"
                subtitle="Controle de operadores, administradores, solicitações de acesso e permissões."
            />

            {totalPendentes > 0 && (
                <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fade-in">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
                            <Clock size={16} />
                        </div>
                        <div>
                            <h4 className="text-sm font-semibold text-amber-900">
                                {totalPendentes} {totalPendentes === 1 ? "solicitação pendente" : "solicitações pendentes"} de aprovação
                            </h4>
                            <p className="text-xs text-amber-700">
                                Novos operadores aguardam validação do administrador para poder acessar a plataforma.
                            </p>
                        </div>
                    </div>
                    {filtroStatus !== "pendente" && (
                        <Button
                            size="sm"
                            variant="primary"
                            className="bg-amber-600 hover:bg-amber-700 text-white shrink-0 self-end sm:self-auto"
                            onClick={() => setFiltroStatus("pendente")}
                        >
                            Filtrar Pendentes
                        </Button>
                    )}
                </div>
            )}

            <Card padding="small" className="space-y-3">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
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

                    <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg border border-slate-200 overflow-x-auto shrink-0">
                        {(
                            [
                                { id: "todos", label: "Todos" },
                                {
                                    id: "pendente",
                                    label: "Pendentes",
                                    badge: totalPendentes > 0 ? totalPendentes : undefined,
                                },
                                { id: "ativo", label: "Ativos" },
                                { id: "inativo", label: "Inativos" },
                                { id: "recusado", label: "Recusados" },
                            ] as { id: FiltroStatusUsuario; label: string; badge?: number }[]
                        ).map((tab) => (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setFiltroStatus(tab.id)}
                                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                                    filtroStatus === tab.id
                                        ? "bg-white text-slate-900 shadow-xs border border-slate-200/80 font-semibold"
                                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                                }`}
                            >
                                <span>{tab.label}</span>
                                {tab.badge !== undefined && (
                                    <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500 text-white font-bold leading-none">
                                        {tab.badge}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
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
                        title={
                            busca
                                ? "Nenhum usuário encontrado"
                                : filtroStatus !== "todos"
                                ? `Nenhum usuário com status "${filtroStatus}"`
                                : "Nenhum usuário localizado"
                        }
                        description={
                            busca
                                ? "Tente alterar os termos de pesquisa para localizar o operador."
                                : filtroStatus !== "todos"
                                ? "Alterne o filtro de status para ver outros operadores."
                                : "Os usuários cadastrados no sistema serão exibidos aqui."
                        }
                        border="none"
                        action={
                            busca || filtroStatus !== "todos" ? (
                                <div className="flex gap-2">
                                    {busca && (
                                        <Button variant="secondary" size="sm" onClick={() => setBusca("")}>
                                            <span>Limpar busca</span>
                                        </Button>
                                    )}
                                    {filtroStatus !== "todos" && (
                                        <Button variant="secondary" size="sm" onClick={() => setFiltroStatus("todos")}>
                                            <span>Ver todos</span>
                                        </Button>
                                    )}
                                </div>
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
                                        <th className="px-5 py-2.5">Status</th>
                                        <th className="px-5 py-2.5">Data de Cadastro</th>
                                        <th className="px-5 py-2.5 text-center">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {usuarios.map((user) => {
                                        const isCurrent = currentUser?.id === user.id;
                                        const isPendente = user.status === "pendente";
                                        const isAtivo = user.status === "ativo";

                                        return (
                                            <tr
                                                key={user.id}
                                                className={`transition-colors duration-150 ease-out ${
                                                    isPendente
                                                        ? "bg-amber-50/30 hover:bg-amber-50/60"
                                                        : "hover:bg-slate-50/75"
                                                }`}
                                            >
                                                <td className="px-5 py-3">
                                                    <div className="flex items-center gap-2.5">
                                                        <Avatar name={user.nome} size="sm" />
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-medium text-slate-900">{user.nome}</span>
                                                                {isCurrent && <Badge variant="primary">Você</Badge>}
                                                                {user.perfil === "admin" && (
                                                                    <Badge variant="violet" dot>Admin</Badge>
                                                                )}
                                                            </div>
                                                            <span className="font-mono text-[11px] text-slate-400">
                                                                ID: {user.id.substring(0, 8)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-3 text-slate-600">{user.email}</td>
                                                <td className="px-5 py-3">
                                                    {renderStatusBadge(user.status)}
                                                </td>
                                                <td className="px-5 py-3 text-slate-500 font-medium tabular-nums">
                                                    {formatDate(user.criado_em)}
                                                </td>
                                                <td className="px-5 py-3 text-center">
                                                    <div className="flex items-center justify-center gap-1">
                                                        {isPendente && (
                                                            <>
                                                                <Button
                                                                    variant="primary"
                                                                    size="sm"
                                                                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs py-1 px-2.5 h-7"
                                                                    title="Aprovar cadastro e liberar acesso"
                                                                    onClick={() => handleAprovar(user)}
                                                                >
                                                                    <Check size={13} className="mr-1" />
                                                                    <span>Aprovar</span>
                                                                </Button>
                                                                <Button
                                                                    variant="danger"
                                                                    size="sm"
                                                                    className="text-xs py-1 px-2.5 h-7"
                                                                    title="Recusar cadastro"
                                                                    onClick={() => handleRecusar(user)}
                                                                >
                                                                    <Ban size={13} className="mr-1" />
                                                                    <span>Recusar</span>
                                                                </Button>
                                                            </>
                                                        )}

                                                        {isAtivo && !isCurrent && (
                                                            <IconButton
                                                                variant="ghost"
                                                                title="Inativar acesso"
                                                                aria-label={`Inativar ${user.nome}`}
                                                                onClick={() => handleInativar(user)}
                                                                className="text-slate-400 hover:text-amber-600"
                                                            >
                                                                <Ban size={15} />
                                                            </IconButton>
                                                        )}

                                                        {(user.status === "inativo" || user.status === "recusado") && (
                                                            <IconButton
                                                                variant="ghost"
                                                                title="Reativar / Aprovar acesso"
                                                                aria-label={`Reativar ${user.nome}`}
                                                                onClick={() => handleAprovar(user)}
                                                                className="text-emerald-600 hover:text-emerald-700"
                                                            >
                                                                <RotateCcw size={15} />
                                                            </IconButton>
                                                        )}

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
                                const isPendente = user.status === "pendente";
                                const isAtivo = user.status === "ativo";

                                return (
                                    <div
                                        key={user.id}
                                        className={`p-4 space-y-3 ${
                                            isPendente ? "bg-amber-50/30" : ""
                                        }`}
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex items-center gap-2.5 min-w-0">
                                                <Avatar name={user.nome} size="sm" />
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="font-medium text-slate-900 text-sm truncate">
                                                            {user.nome}
                                                        </h4>
                                                        {isCurrent && <Badge variant="primary">Você</Badge>}
                                                        {user.perfil === "admin" && (
                                                            <Badge variant="violet" dot>Admin</Badge>
                                                        )}
                                                    </div>
                                                    <span className="text-xs text-slate-500 block truncate">
                                                        {user.email}
                                                    </span>
                                                </div>
                                            </div>
                                            <div>{renderStatusBadge(user.status)}</div>
                                        </div>

                                        {user.criado_em && (
                                            <div className="text-xs text-slate-400">
                                                Cadastrado em:{" "}
                                                <span className="text-slate-600 font-medium">
                                                    {formatDate(user.criado_em)}
                                                </span>
                                            </div>
                                        )}

                                        <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-slate-100">
                                            {isPendente && (
                                                <>
                                                    <Button
                                                        variant="primary"
                                                        size="sm"
                                                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                                                        onClick={() => handleAprovar(user)}
                                                    >
                                                        <Check size={14} />
                                                        <span>Aprovar</span>
                                                    </Button>
                                                    <Button
                                                        variant="danger"
                                                        size="sm"
                                                        onClick={() => handleRecusar(user)}
                                                    >
                                                        <Ban size={14} />
                                                        <span>Recusar</span>
                                                    </Button>
                                                </>
                                            )}

                                            {isAtivo && !isCurrent && (
                                                <Button
                                                    variant="secondary"
                                                    size="sm"
                                                    onClick={() => handleInativar(user)}
                                                >
                                                    <Ban size={14} />
                                                    <span>Inativar</span>
                                                </Button>
                                            )}

                                            {(user.status === "inativo" || user.status === "recusado") && (
                                                <Button
                                                    variant="secondary"
                                                    size="sm"
                                                    className="text-emerald-700 border-emerald-300"
                                                    onClick={() => handleAprovar(user)}
                                                >
                                                    <RotateCcw size={14} />
                                                    <span>Reativar</span>
                                                </Button>
                                            )}

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
