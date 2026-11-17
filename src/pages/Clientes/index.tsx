import { Edit2, Plus, Power, Search, Trash2 } from "lucide-react";
import { useState } from "react";
import { StatusBadge } from "../../components/ui/Badge";
import { Button, IconButton } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { EmptyState } from "../../components/ui/EmptyState";
import { Input } from "../../components/ui/Input";
import { PageHeader } from "../../components/ui/PageHeader";
import { Pagination } from "../../components/ui/Pagination";
import { Select } from "../../components/ui/Select";
import { Skeleton } from "../../components/ui/Skeleton";
import { useClientes, type FiltroStatusCliente, type FiltroTipoCliente } from "../../hooks/useClientes";
import type { Cliente } from "../../types";
import { formatDocumento, formatTelefone } from "../../utils/formatters";
import { ClienteFormModal } from "./ClienteFormModal";

export function Clientes() {
    const {
        clientes,
        totalClientes,
        pagina,
        setPagina,
        totalPaginas,
        itensPorPagina,
        loading,
        busca,
        setBusca,
        filtroStatus,
        setFiltroStatus,
        filtroTipo,
        setFiltroTipo,
        recarregar,
        toggleStatusCliente,
        deleteCliente,
    } = useClientes();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [clienteToEdit, setClienteToEdit] = useState<Cliente | null>(null);

    function handleOpenCreate() {
        setClienteToEdit(null);
        setIsModalOpen(true);
    }

    function handleOpenEdit(cliente: Cliente) {
        setClienteToEdit(cliente);
        setIsModalOpen(true);
    }

    function handleSuccess() {
        setIsModalOpen(false);
        recarregar();
    }

    async function handleToggleStatus(cliente: Cliente) {
        const novoStatus = !cliente.ativo;
        const acao = novoStatus ? "ativar" : "inativar";
        if (!window.confirm(`Deseja realmente ${acao} o cliente "${cliente.nome}"?`)) {
            return;
        }

        const res = await toggleStatusCliente(cliente.id, cliente.ativo);
        if (!res.success) {
            alert(res.error);
        }
    }

    async function handleDelete(cliente: Cliente) {
        if (!window.confirm(`Deseja realmente excluir o cliente "${cliente.nome}"? Ação irreversível.`)) {
            return;
        }

        const res = await deleteCliente(cliente.id);
        if (!res.success) {
            alert(res.error);
        }
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title="Carteira de Clientes"
                subtitle="Gerencie os dados cadastrais, situação contratual e contatos de clientes PF e PJ."
            >
                <Button onClick={handleOpenCreate}>
                    <Plus size={16} />
                    <span>Novo Cliente</span>
                </Button>
            </PageHeader>

            <Card padding="small" className="flex flex-col sm:flex-row items-center gap-3">
                <div className="flex-1 w-full">
                    <Input
                        startIcon={<Search size={15} />}
                        placeholder="Buscar por nome, documento, e-mail ou cidade..."
                        value={busca}
                        onChange={(e) => setBusca(e.target.value)}
                    />
                </div>
                <div className="w-full sm:w-56 shrink-0">
                    <Select
                        value={filtroStatus}
                        onChange={(e) => setFiltroStatus(e.target.value as FiltroStatusCliente)}
                    >
                        <option value="todos">Todos os status</option>
                        <option value="ativos">Apenas Ativos</option>
                        <option value="inativos">Apenas Inativos</option>
                    </Select>
                </div>
                <div className="w-full sm:w-60 shrink-0">
                    <Select value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value as FiltroTipoCliente)}>
                        <option value="todos">Pessoa Física e Jurídica</option>
                        <option value="PF">Pessoa Física (PF)</option>
                        <option value="PJ">Pessoa Jurídica (PJ)</option>
                    </Select>
                </div>
            </Card>

            <Card padding="none" className="overflow-hidden">
                {loading ? (
                    <div className="p-6 space-y-3">
                        <Skeleton className="w-full h-9" />
                        <Skeleton className="w-full h-9" />
                        <Skeleton className="w-full h-9" />
                    </div>
                ) : clientes.length === 0 ? (
                    <EmptyState
                        title="Nenhum cliente encontrado"
                        description={
                            busca || filtroStatus !== "todos" || filtroTipo !== "todos"
                                ? "Tente alterar os termos ou filtros de pesquisa."
                                : "Cadastre o primeiro cliente da sua base comercial."
                        }
                        border="none"
                        action={
                            !busca && filtroStatus === "todos" && filtroTipo === "todos" ? (
                                <Button size="sm" onClick={handleOpenCreate}>
                                    <Plus size={15} />
                                    <span>Cadastrar Cliente</span>
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
                                        <th className="px-5 py-2.5">Cliente</th>
                                        <th className="px-5 py-2.5">Documento</th>
                                        <th className="px-5 py-2.5">Contato</th>
                                        <th className="px-5 py-2.5">Cidade / UF</th>
                                        <th className="px-5 py-2.5 text-center">Situação</th>
                                        <th className="px-5 py-2.5 text-center">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {clientes.map((cliente) => (
                                        <tr
                                            key={cliente.id}
                                            className="hover:bg-slate-50/75 transition-colors duration-150 ease-out"
                                        >
                                            <td className="px-5 py-3">
                                                <div className="font-medium text-slate-900">{cliente.nome}</div>
                                                <span className="text-[11px] text-slate-400">
                                                    {cliente.tipo_pessoa === "PJ" ? "Pessoa Jurídica" : "Pessoa Física"}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3 font-mono text-slate-500">
                                                {formatDocumento(cliente.documento, cliente.tipo_pessoa)}
                                            </td>
                                            <td className="px-5 py-3">
                                                <div className="text-slate-900 font-medium">
                                                    {formatTelefone(cliente.telefone) || "-"}
                                                </div>
                                                {cliente.email && (
                                                    <div className="text-[11px] text-slate-400 mt-0.5 truncate max-w-44">
                                                        {cliente.email}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-5 py-3 text-slate-600">
                                                {cliente.cidade ? `${cliente.cidade}/${cliente.estado || ""}` : "-"}
                                            </td>
                                            <td className="px-5 py-3 text-center">
                                                <StatusBadge status={cliente.ativo ? "ativo" : "inativo"} />
                                            </td>
                                            <td className="px-5 py-3">
                                                <div className="flex items-center justify-center gap-1">
                                                    <IconButton
                                                        title="Editar cliente"
                                                        aria-label={`Editar cliente ${cliente.nome}`}
                                                        onClick={() => handleOpenEdit(cliente)}
                                                    >
                                                        <Edit2 size={15} />
                                                    </IconButton>
                                                    <IconButton
                                                        title={cliente.ativo ? "Inativar cliente" : "Ativar cliente"}
                                                        aria-label={cliente.ativo ? "Inativar cliente" : "Ativar cliente"}
                                                        className={
                                                            cliente.ativo
                                                                ? "text-slate-400 hover:text-amber-600 hover:bg-amber-50"
                                                                : "text-slate-400 hover:text-emerald-600 hover:bg-emerald-50"
                                                        }
                                                        onClick={() => handleToggleStatus(cliente)}
                                                    >
                                                        <Power size={15} />
                                                    </IconButton>
                                                    <IconButton
                                                        variant="danger"
                                                        title="Excluir cliente"
                                                        aria-label={`Excluir cliente ${cliente.nome}`}
                                                        onClick={() => handleDelete(cliente)}
                                                    >
                                                        <Trash2 size={15} />
                                                    </IconButton>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="md:hidden divide-y divide-slate-100">
                            {clientes.map((cliente) => (
                                <div key={cliente.id} className="p-4 space-y-2.5">
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <h4 className="font-medium text-slate-900 text-sm">{cliente.nome}</h4>
                                            <span className="font-mono text-xs text-slate-500">
                                                {formatDocumento(cliente.documento, cliente.tipo_pessoa)}
                                            </span>
                                        </div>
                                        <StatusBadge status={cliente.ativo ? "ativo" : "inativo"} />
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-md">
                                        <div>
                                            <span className="text-slate-400 block">Contato</span>
                                            <span className="font-medium text-slate-800">
                                                {formatTelefone(cliente.telefone) || "-"}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-slate-400 block">Localidade</span>
                                            <span className="font-medium text-slate-800">
                                                {cliente.cidade ? `${cliente.cidade}/${cliente.estado || ""}` : "-"}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100">
                                        <Button variant="secondary" size="sm" onClick={() => handleOpenEdit(cliente)}>
                                            <Edit2 size={14} />
                                            <span>Editar</span>
                                        </Button>
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            onClick={() => handleToggleStatus(cliente)}
                                        >
                                            <Power size={14} />
                                            <span>{cliente.ativo ? "Inativar" : "Ativar"}</span>
                                        </Button>
                                        <Button variant="danger" size="sm" onClick={() => handleDelete(cliente)}>
                                            <Trash2 size={14} />
                                            <span>Excluir</span>
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <Pagination
                            currentPage={pagina}
                            totalPages={totalPaginas}
                            totalItems={totalClientes}
                            pageSize={itensPorPagina}
                            onPageChange={setPagina}
                            itemName="clientes"
                        />
                    </>
                )}
            </Card>

            <ClienteFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                clienteToEdit={clienteToEdit}
                onSuccess={handleSuccess}
            />
        </div>
    );
}
