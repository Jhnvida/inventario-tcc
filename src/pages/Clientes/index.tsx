import { Edit2, Plus, Power, Search, Trash2 } from "lucide-react";
import { useState } from "react";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
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
                    <Plus size={18} />
                    <span>Novo Cliente</span>
                </Button>
            </PageHeader>

            <div className="p-3 sm:p-4 rounded-lg bg-white border border-slate-200 grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="relative sm:col-span-6">
                    <Search
                        size={15}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                    />
                    <Input
                        placeholder="Buscar por nome, documento, e-mail ou cidade..."
                        value={busca}
                        onChange={(e) => setBusca(e.target.value)}
                        className="pl-8.5!"
                    />
                </div>
                <div className="sm:col-span-3">
                    <Select
                        value={filtroStatus}
                        onChange={(e) => setFiltroStatus(e.target.value as FiltroStatusCliente)}
                    >
                        <option value="todos">Todos os status</option>
                        <option value="ativos">Apenas Ativos</option>
                        <option value="inativos">Apenas Inativos</option>
                    </Select>
                </div>
                <div className="sm:col-span-3">
                    <Select value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value as FiltroTipoCliente)}>
                        <option value="todos">Pessoa Física e Jurídica</option>
                        <option value="PF">Pessoa Física (PF)</option>
                        <option value="PJ">Pessoa Jurídica (PJ)</option>
                    </Select>
                </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
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
                        action={
                            !busca && filtroStatus === "todos" && filtroTipo === "todos" ? (
                                <Button size="sm" onClick={handleOpenCreate}>
                                    <Plus size={16} />
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
                                        <tr key={cliente.id} className="hover:bg-slate-50/60 transition-colors">
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
                                                    <div className="text-[11px] text-slate-400 mt-0.5 truncate max-w-45">
                                                        {cliente.email}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-5 py-3 text-slate-600">
                                                {cliente.cidade ? `${cliente.cidade}/${cliente.estado || ""}` : "-"}
                                            </td>
                                            <td className="px-5 py-3 text-center">
                                                <Badge variant={cliente.ativo ? "success" : "neutral"}>
                                                    {cliente.ativo ? "Ativo" : "Inativo"}
                                                </Badge>
                                            </td>
                                            <td className="px-5 py-3">
                                                <div className="flex items-center justify-center gap-1">
                                                    <button
                                                        type="button"
                                                        className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                                                        onClick={() => handleOpenEdit(cliente)}
                                                        title="Editar cliente"
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                                                            cliente.ativo
                                                                ? "text-slate-400 hover:text-amber-600 hover:bg-amber-50"
                                                                : "text-slate-400 hover:text-emerald-600 hover:bg-emerald-50"
                                                        }`}
                                                        onClick={() => handleToggleStatus(cliente)}
                                                        title={cliente.ativo ? "Inativar cliente" : "Ativar cliente"}
                                                    >
                                                        <Power size={16} />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="p-1.5 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                                                        onClick={() => handleDelete(cliente)}
                                                        title="Excluir cliente"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
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
                                        <Badge variant={cliente.ativo ? "success" : "neutral"}>
                                            {cliente.ativo ? "Ativo" : "Inativo"}
                                        </Badge>
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
                                            <Edit2 size={15} />
                                            <span>Editar</span>
                                        </Button>
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            onClick={() => handleToggleStatus(cliente)}
                                        >
                                            <Power size={15} />
                                            <span>{cliente.ativo ? "Inativar" : "Ativar"}</span>
                                        </Button>
                                        <Button variant="danger" size="sm" onClick={() => handleDelete(cliente)}>
                                            <Trash2 size={15} />
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
            </div>

            <ClienteFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                clienteToEdit={clienteToEdit}
                onSuccess={() => {
                    setIsModalOpen(false);
                }}
            />
        </div>
    );
}
