import { Edit2, Plus, Search, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "../../components/ui/Button";
import { EmptyState } from "../../components/ui/EmptyState";
import { Input } from "../../components/ui/Input";
import { PageHeader } from "../../components/ui/PageHeader";
import { Pagination } from "../../components/ui/Pagination";
import { Skeleton } from "../../components/ui/Skeleton";
import { useFornecedores } from "../../hooks/useFornecedores";
import type { Fornecedor } from "../../types";
import { formatCNPJ, formatTelefone } from "../../utils/formatters";
import { FornecedorFormModal } from "./FornecedorFormModal";

export function Fornecedores() {
    const {
        fornecedores,
        totalFornecedores,
        pagina,
        setPagina,
        totalPaginas,
        itensPorPagina,
        loading,
        busca,
        setBusca,
        recarregar,
        deleteFornecedor,
    } = useFornecedores();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [fornecedorToEdit, setFornecedorToEdit] = useState<Fornecedor | null>(null);

    function handleOpenCreate() {
        setFornecedorToEdit(null);
        setIsModalOpen(true);
    }

    function handleOpenEdit(fornecedor: Fornecedor) {
        setFornecedorToEdit(fornecedor);
        setIsModalOpen(true);
    }

    function handleSuccess() {
        setIsModalOpen(false);
        recarregar();
    }

    async function handleDelete(id: string, razao: string) {
        if (!window.confirm(`Tem certeza que deseja excluir o fornecedor "${razao}"?`)) return;

        const res = await deleteFornecedor(id);
        if (!res.success) {
            alert(res.error);
        }
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title="Fornecedores"
                subtitle="Gerencie a base de parceiros comerciais, distribuidores e contatos para reposição."
            >
                <Button onClick={handleOpenCreate}>
                    <Plus size={18} />
                    <span>Novo Fornecedor</span>
                </Button>
            </PageHeader>

            <div className="p-3 sm:p-4 rounded-lg bg-white border border-slate-200 flex items-center gap-3">
                <div className="relative flex-1 w-full">
                    <Search
                        size={15}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                    />
                    <Input
                        placeholder="Buscar por razão social, nome fantasia ou CNPJ..."
                        value={busca}
                        onChange={(e) => setBusca(e.target.value)}
                        className="pl-8.5!"
                    />
                </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                {loading ? (
                    <div className="p-6 space-y-3">
                        <Skeleton className="w-full h-9" />
                        <Skeleton className="w-full h-9" />
                        <Skeleton className="w-full h-9" />
                    </div>
                ) : fornecedores.length === 0 ? (
                    <EmptyState
                        title="Nenhum fornecedor encontrado"
                        description={
                            busca
                                ? "Tente alterar os termos de pesquisa para localizar o parceiro."
                                : "Cadastre os fornecedores responsáveis pelo fornecimento dos produtos."
                        }
                        action={
                            !busca ? (
                                <Button size="sm" onClick={handleOpenCreate}>
                                    <Plus size={16} />
                                    <span>Cadastrar Fornecedor</span>
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
                                        <th className="px-5 py-2.5">Razão Social & Nome Fantasia</th>
                                        <th className="px-5 py-2.5">CNPJ</th>
                                        <th className="px-5 py-2.5">Telefone</th>
                                        <th className="px-5 py-2.5">E-mail Comercial</th>
                                        <th className="px-5 py-2.5 text-center">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {fornecedores.map((fornecedor) => (
                                        <tr
                                            key={fornecedor.id}
                                            className="hover:bg-slate-50/75 transition-colors duration-150 ease-out"
                                        >
                                            <td className="px-5 py-3">
                                                <div className="font-medium text-slate-900">
                                                    {fornecedor.razao_social}
                                                </div>
                                                {fornecedor.nome_fantasia && (
                                                    <div className="text-[11px] text-slate-400 mt-0.5">
                                                        {fornecedor.nome_fantasia}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-5 py-3 font-mono text-slate-500">
                                                {formatCNPJ(fornecedor.cnpj) || "-"}
                                            </td>
                                            <td className="px-5 py-3 text-slate-700 font-medium">
                                                {formatTelefone(fornecedor.telefone) || "-"}
                                            </td>
                                            <td className="px-5 py-3 text-slate-500 truncate max-w-50">
                                                {fornecedor.email || "-"}
                                            </td>
                                            <td className="px-5 py-3">
                                                <div className="flex items-center justify-center gap-1">
                                                    <button
                                                        type="button"
                                                        className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 active:scale-95 transition-all duration-150 ease-out cursor-pointer"
                                                        onClick={() => handleOpenEdit(fornecedor)}
                                                        title="Editar fornecedor"
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="p-1.5 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 active:scale-95 transition-all duration-150 ease-out cursor-pointer"
                                                        onClick={() =>
                                                            handleDelete(fornecedor.id, fornecedor.razao_social)
                                                        }
                                                        title="Excluir fornecedor"
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
                            {fornecedores.map((fornecedor) => (
                                <div key={fornecedor.id} className="p-4 space-y-2.5">
                                    <div>
                                        <h4 className="font-medium text-slate-900 text-sm">
                                            {fornecedor.razao_social}
                                        </h4>
                                        <span className="font-mono text-xs text-slate-500">
                                            {formatCNPJ(fornecedor.cnpj) || "-"}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-md">
                                        <div>
                                            <span className="text-slate-400 block">Telefone</span>
                                            <span className="font-medium text-slate-800">
                                                {formatTelefone(fornecedor.telefone) || "-"}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-slate-400 block">E-mail</span>
                                            <span className="font-medium text-slate-800 truncate block">
                                                {fornecedor.email || "-"}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100">
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            onClick={() => handleOpenEdit(fornecedor)}
                                        >
                                            <Edit2 size={15} />
                                            <span>Editar</span>
                                        </Button>
                                        <Button
                                            variant="danger"
                                            size="sm"
                                            onClick={() => handleDelete(fornecedor.id, fornecedor.razao_social)}
                                        >
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
                            totalItems={totalFornecedores}
                            pageSize={itensPorPagina}
                            onPageChange={setPagina}
                            itemName="fornecedores"
                        />
                    </>
                )}
            </div>

            <FornecedorFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                fornecedorToEdit={fornecedorToEdit}
                onSuccess={handleSuccess}
            />
        </div>
    );
}
