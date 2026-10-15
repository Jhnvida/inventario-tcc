import { AlertCircle, Edit2, Plus, Tags, Trash2 } from "lucide-react";
import { useState, type SubmitEvent } from "react";
import { Button } from "../../components/ui/Button";
import { EmptyState } from "../../components/ui/EmptyState";
import { Input } from "../../components/ui/Input";
import { Modal } from "../../components/ui/Modal";
import { PageHeader } from "../../components/ui/PageHeader";
import { Pagination } from "../../components/ui/Pagination";
import { Skeleton } from "../../components/ui/Skeleton";
import { useCategorias } from "../../hooks/useCategorias";

export function Categorias() {
    const {
        categorias,
        totalCategorias,
        pagina,
        setPagina,
        totalPaginas,
        itensPorPagina,
        loading,
        deleteCategoria,
        createCategoria,
        updateCategoria,
    } = useCategorias();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [categoriaEditando, setCategoriaEditando] = useState<{ id: string; nome: string } | null>(null);
    const [novaCategoria, setNovaCategoria] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(e: SubmitEvent) {
        e.preventDefault();
        if (!novaCategoria.trim()) {
            setError("O nome da categoria é obrigatório.");
            return;
        }

        setIsSubmitting(true);
        setError(null);

        const res = categoriaEditando
            ? await updateCategoria(categoriaEditando.id, novaCategoria.trim())
            : await createCategoria(novaCategoria.trim());

        if (res.success) {
            setIsModalOpen(false);
            setNovaCategoria("");
            setCategoriaEditando(null);
        } else {
            setError(res.error || "Erro ao salvar categoria.");
        }

        setIsSubmitting(false);
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
            alert(res.error);
        }
    }

    function handleOpenCreate() {
        setCategoriaEditando(null);
        setNovaCategoria("");
        setError(null);
        setIsModalOpen(true);
    }

    function handleOpenEdit(cat: { id: string; nome: string }) {
        setCategoriaEditando(cat);
        setNovaCategoria(cat.nome);
        setError(null);
        setIsModalOpen(true);
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

            <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                {loading ? (
                    <div className="p-6 space-y-3">
                        <Skeleton className="w-full h-9" />
                        <Skeleton className="w-full h-9" />
                        <Skeleton className="w-full h-9" />
                    </div>
                ) : categorias.length === 0 ? (
                    <EmptyState
                        icon={Tags}
                        title="Nenhuma categoria cadastrada"
                        description="Crie categorias para agrupar e organizar os produtos do inventário."
                        action={
                            <Button size="sm" onClick={handleOpenCreate}>
                                <Plus size={16} />
                                <span>Criar Categoria</span>
                            </Button>
                        }
                    />
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs border-collapse">
                                <thead className="bg-slate-50/50 border-b border-slate-200 text-slate-600 font-medium">
                                    <tr>
                                        <th className="px-5 py-2.5">Nome da Categoria</th>
                                        <th className="px-5 py-2.5 text-right">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {categorias.map((cat) => (
                                        <tr key={cat.id} className="hover:bg-slate-50/60 transition-colors">
                                            <td className="px-5 py-3">
                                                <span className="font-medium text-slate-900">{cat.nome}</span>
                                            </td>
                                            <td className="px-5 py-3 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button
                                                        type="button"
                                                        className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                                                        onClick={() => handleOpenEdit(cat)}
                                                        title="Editar categoria"
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="p-1.5 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                                                        onClick={() => handleDelete(cat.id, cat.nome)}
                                                        title="Excluir categoria"
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
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={categoriaEditando ? "Editar Categoria" : "Nova Categoria"}
                width="small"
            >
                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-2">
                            <AlertCircle size={15} className="shrink-0 text-red-600" />
                            <span>{error}</span>
                        </div>
                    )}

                    <Input
                        label="Nome da Categoria"
                        placeholder="Ex: Cabos e Conectores"
                        value={novaCategoria}
                        onChange={(e) => setNovaCategoria(e.target.value)}
                        required
                        autoFocus
                    />

                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                        <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" variant="primary" disabled={isSubmitting}>
                            {isSubmitting ? "Salvando..." : categoriaEditando ? "Salvar Alterações" : "Criar Categoria"}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
