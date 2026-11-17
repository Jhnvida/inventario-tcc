import { Edit2, Plus, Search, Tags, Trash2, X } from "lucide-react";
import { useState } from "react";
import { Button, IconButton } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { EmptyState } from "../../components/ui/EmptyState";
import { Input } from "../../components/ui/Input";
import { PageHeader } from "../../components/ui/PageHeader";
import { Pagination } from "../../components/ui/Pagination";
import { Skeleton } from "../../components/ui/Skeleton";
import { useCategorias } from "../../hooks/useCategorias";
import type { Categoria } from "../../types";
import { formatDate } from "../../utils/formatters";
import { CategoriaFormModal } from "./CategoriaFormModal";

export function Categorias() {
    const {
        categorias,
        totalCategorias,
        pagina,
        setPagina,
        totalPaginas,
        itensPorPagina,
        loading,
        busca,
        setBusca,
        recarregar,
        deleteCategoria,
    } = useCategorias();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [categoriaToEdit, setCategoriaToEdit] = useState<Categoria | null>(null);

    function handleOpenCreate() {
        setCategoriaToEdit(null);
        setIsModalOpen(true);
    }

    function handleOpenEdit(cat: Categoria) {
        setCategoriaToEdit(cat);
        setIsModalOpen(true);
    }

    function handleSuccess() {
        setIsModalOpen(false);
        recarregar();
    }

    async function handleDelete(id: string, nome: string) {
        if (
            !window.confirm(
                `Tem certeza que deseja excluir a categoria "${nome}"? Produtos vinculados perderão a categoria.`,
            )
        ) {
            return;
        }

        const res = await deleteCategoria(id);
        if (!res.success) {
            alert(res.error || "Erro ao excluir categoria.");
        }
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title="Categorias de Produtos"
                subtitle="Classificação taxonômica para organização dos itens no catálogo e relatórios."
            >
                <Button onClick={handleOpenCreate}>
                    <Plus size={16} />
                    <span>Nova Categoria</span>
                </Button>
            </PageHeader>

            <Card padding="small" className="flex items-center gap-3">
                <div className="flex-1 w-full">
                    <Input
                        startIcon={<Search size={15} />}
                        placeholder="Buscar por nome da categoria..."
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
                ) : categorias.length === 0 ? (
                    <EmptyState
                        icon={Tags}
                        title={busca ? "Nenhuma categoria encontrada" : "Nenhuma categoria cadastrada"}
                        description={
                            busca
                                ? "Tente ajustar os termos de pesquisa para localizar a categoria desejada."
                                : "Crie categorias para agrupar e organizar os produtos do catálogo."
                        }
                        border="none"
                        action={
                            busca ? (
                                <Button variant="secondary" size="sm" onClick={() => setBusca("")}>
                                    <span>Limpar busca</span>
                                </Button>
                            ) : (
                                <Button size="sm" onClick={handleOpenCreate}>
                                    <Plus size={15} />
                                    <span>Criar Categoria</span>
                                </Button>
                            )
                        }
                    />
                ) : (
                    <>
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-left text-xs border-collapse">
                                <thead className="bg-slate-50/50 border-b border-slate-200 text-slate-600 font-medium">
                                    <tr>
                                        <th className="px-5 py-2.5">Nome da Categoria</th>
                                        <th className="px-5 py-2.5">Data de Cadastro</th>
                                        <th className="px-5 py-2.5 text-center">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {categorias.map((cat) => (
                                        <tr
                                            key={cat.id}
                                            className="hover:bg-slate-50/75 transition-colors duration-150 ease-out"
                                        >
                                            <td className="px-5 py-3">
                                                <span className="font-medium text-slate-900">{cat.nome}</span>
                                            </td>
                                            <td className="px-5 py-3 text-slate-500 font-medium tabular-nums">
                                                {formatDate(cat.criado_em)}
                                            </td>
                                            <td className="px-5 py-3 text-center">
                                                <div className="flex items-center justify-center gap-1">
                                                    <IconButton
                                                        title="Editar categoria"
                                                        aria-label={`Editar categoria ${cat.nome}`}
                                                        onClick={() => handleOpenEdit(cat)}
                                                    >
                                                        <Edit2 size={15} />
                                                    </IconButton>
                                                    <IconButton
                                                        variant="danger"
                                                        title="Excluir categoria"
                                                        aria-label={`Excluir categoria ${cat.nome}`}
                                                        onClick={() => handleDelete(cat.id, cat.nome)}
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
                            {categorias.map((cat) => (
                                <div key={cat.id} className="p-4 space-y-3">
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <h4 className="font-medium text-slate-900 text-sm">{cat.nome}</h4>
                                            {cat.criado_em && (
                                                <span className="text-[11px] text-slate-400">
                                                    Cadastrada em: {formatDate(cat.criado_em)}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100">
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            onClick={() => handleOpenEdit(cat)}
                                        >
                                            <Edit2 size={14} />
                                            <span>Editar</span>
                                        </Button>
                                        <Button
                                            variant="danger"
                                            size="sm"
                                            onClick={() => handleDelete(cat.id, cat.nome)}
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
                            totalItems={totalCategorias}
                            pageSize={itensPorPagina}
                            onPageChange={setPagina}
                            itemName="categorias"
                        />
                    </>
                )}
            </Card>

            <CategoriaFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                categoriaToEdit={categoriaToEdit}
                onSuccess={handleSuccess}
            />
        </div>
    );
}
