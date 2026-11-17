import { Edit2, Plus, Search, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button, IconButton } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
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
                    <Plus size={16} />
                    <span>Novo Fornecedor</span>
                </Button>
            </PageHeader>

            <Card padding="small" className="flex items-center gap-3">
                <div className="flex-1 w-full">
                    <Input
                        startIcon={<Search size={15} />}
                        placeholder="Buscar por razão social, nome fantasia ou CNPJ..."
                        value={busca}
                        onChange={(e) => setBusca(e.target.value)}
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
                ) : fornecedores.length === 0 ? (
                    <EmptyState
                        title="Nenhum fornecedor encontrado"
                        description={
                            busca
                                ? "Tente alterar os termos de pesquisa para localizar o parceiro."
                                : "Cadastre os fornecedores responsáveis pelo fornecimento dos produtos."
                        }
                        border="none"
                        action={
                            !busca ? (
                                <Button size="sm" onClick={handleOpenCreate}>
                                    <Plus size={15} />
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
                                            <td className="px-5 py-3 text-slate-500 truncate max-w-52">
                                                {fornecedor.email || "-"}
                                            </td>
                                            <td className="px-5 py-3">
                                                <div className="flex items-center justify-center gap-1">
                                                    <IconButton
                                                        title="Editar fornecedor"
                                                        aria-label={`Editar fornecedor ${fornecedor.razao_social}`}
                                                        onClick={() => handleOpenEdit(fornecedor)}
                                                    >
                                                        <Edit2 size={15} />
                                                    </IconButton>
                                                    <IconButton
                                                        variant="danger"
                                                        title="Excluir fornecedor"
                                                        aria-label={`Excluir fornecedor ${fornecedor.razao_social}`}
                                                        onClick={() =>
                                                            handleDelete(fornecedor.id, fornecedor.razao_social)
                                                        }
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
                                            <Edit2 size={14} />
                                            <span>Editar</span>
                                        </Button>
                                        <Button
                                            variant="danger"
                                            size="sm"
                                            onClick={() => handleDelete(fornecedor.id, fornecedor.razao_social)}
                                        >
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
                            totalItems={totalFornecedores}
                            pageSize={itensPorPagina}
                            onPageChange={setPagina}
                            itemName="fornecedores"
                        />
                    </>
                )}
            </Card>

            <FornecedorFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                fornecedorToEdit={fornecedorToEdit}
                onSuccess={handleSuccess}
            />
        </div>
    );
}
