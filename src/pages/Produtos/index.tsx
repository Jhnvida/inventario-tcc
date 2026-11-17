import { Edit2, Plus, Search, Trash2 } from "lucide-react";
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
import { useProdutos, type ProdutoComCategoria } from "../../hooks/useProdutos";
import type { Produto } from "../../types";
import { formatCurrency } from "../../utils/formatters";
import { ProdutoFormModal } from "./ProdutoFormModal";

export function Produtos() {
    const {
        produtos,
        categorias,
        loading,
        busca,
        setBusca,
        categoriaFiltro,
        setCategoriaFiltro,
        pagina,
        setPagina,
        totalProdutos,
        totalPaginas,
        itensPorPagina,
        recarregar,
        deleteProduto,
    } = useProdutos();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [produtoToEdit, setProdutoToEdit] = useState<Produto | null>(null);

    function handleOpenCreate() {
        setProdutoToEdit(null);
        setIsModalOpen(true);
    }

    function handleOpenEdit(produto: ProdutoComCategoria) {
        setProdutoToEdit(produto);
        setIsModalOpen(true);
    }

    function handleSuccess() {
        setIsModalOpen(false);
        recarregar();
    }

    async function handleDelete(id: string, nome: string) {
        if (!window.confirm(`Tem certeza que deseja excluir o produto "${nome}"?`)) return;

        const res = await deleteProduto(id);
        if (!res.success) {
            alert(res.error);
        }
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title="Catálogo de Produtos"
                subtitle="Gerencie as mercadorias, parametrizações e níveis de estoque."
            >
                <Button onClick={handleOpenCreate}>
                    <Plus size={16} />
                    <span>Novo Produto</span>
                </Button>
            </PageHeader>

            <Card padding="small" className="flex flex-col sm:flex-row items-center gap-3">
                <div className="flex-1 w-full">
                    <Input
                        startIcon={<Search size={15} />}
                        placeholder="Buscar por nome ou SKU..."
                        value={busca}
                        onChange={(e) => setBusca(e.target.value)}
                    />
                </div>
                <div className="w-full sm:w-64 shrink-0">
                    <Select value={categoriaFiltro} onChange={(e) => setCategoriaFiltro(e.target.value)}>
                        <option value="">Todas as categorias</option>
                        {categorias.map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.nome}
                            </option>
                        ))}
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
                ) : produtos.length === 0 ? (
                    <EmptyState
                        title="Nenhum produto encontrado"
                        description={
                            busca || categoriaFiltro
                                ? "Tente ajustar os filtros de busca ou categoria para localizar itens."
                                : "Comece cadastrando o primeiro produto do seu estoque."
                        }
                        border="none"
                        action={
                            !busca && !categoriaFiltro ? (
                                <Button size="sm" onClick={handleOpenCreate}>
                                    <Plus size={15} />
                                    <span>Adicionar Produto</span>
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
                                        <th className="px-5 py-2.5">Produto</th>
                                        <th className="px-5 py-2.5">SKU</th>
                                        <th className="px-5 py-2.5">Categoria</th>
                                        <th className="px-5 py-2.5 text-right">Preço Un.</th>
                                        <th className="px-5 py-2.5 text-right">Estoque</th>
                                        <th className="px-5 py-2.5 text-center">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {produtos.map((produto) => {
                                        const isZerado = produto.quantidade === 0;
                                        const isCritico = produto.quantidade <= produto.estoque_minimo;
                                        return (
                                            <tr
                                                key={produto.id}
                                                className="hover:bg-slate-50/75 transition-colors duration-150 ease-out"
                                            >
                                                <td className="px-5 py-3">
                                                    <div className="font-medium text-slate-900">{produto.nome}</div>
                                                    {produto.localizacao && (
                                                        <div className="text-[11px] text-slate-400 mt-0.5">
                                                            Armazém: {produto.localizacao}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-5 py-3 font-mono text-slate-500">{produto.sku}</td>
                                                <td className="px-5 py-3 text-slate-600">
                                                    {produto.categorias?.nome || "Sem categoria"}
                                                </td>
                                                <td className="px-5 py-3 text-right font-medium text-slate-900 tabular-nums">
                                                    {formatCurrency(produto.preco)}
                                                </td>
                                                <td className="px-5 py-3 text-right">
                                                    <div className="inline-flex flex-col items-end gap-0.5">
                                                        <div className="flex items-center gap-1.5">
                                                            {isZerado ? (
                                                                <StatusBadge status="zerado" />
                                                            ) : isCritico ? (
                                                                <StatusBadge status="critico" />
                                                            ) : null}
                                                            <span
                                                                className={`font-semibold tabular-nums ${
                                                                    isZerado
                                                                        ? "text-red-600"
                                                                        : isCritico
                                                                          ? "text-amber-600"
                                                                          : "text-slate-900"
                                                                }`}
                                                            >
                                                                {produto.quantidade} un
                                                            </span>
                                                        </div>
                                                        <span className="text-[11px] text-slate-400 tabular-nums">
                                                            mín: {produto.estoque_minimo}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-3">
                                                    <div className="flex items-center justify-center gap-1">
                                                        <IconButton
                                                            title="Editar produto"
                                                            aria-label={`Editar produto ${produto.nome}`}
                                                            onClick={() => handleOpenEdit(produto)}
                                                        >
                                                            <Edit2 size={15} />
                                                        </IconButton>
                                                        <IconButton
                                                            variant="danger"
                                                            title="Excluir produto"
                                                            aria-label={`Excluir produto ${produto.nome}`}
                                                            onClick={() => handleDelete(produto.id, produto.nome)}
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
                            {produtos.map((produto) => {
                                const isZerado = produto.quantidade === 0;
                                const isCritico = produto.quantidade <= produto.estoque_minimo;
                                return (
                                    <div key={produto.id} className="p-4 space-y-3">
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <h4 className="font-medium text-slate-900 text-sm">{produto.nome}</h4>
                                                <span className="font-mono text-xs text-slate-500">{produto.sku}</span>
                                            </div>
                                            {isZerado ? (
                                                <StatusBadge status="zerado" />
                                            ) : isCritico ? (
                                                <StatusBadge status="critico" />
                                            ) : null}
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-md">
                                            <div>
                                                <span className="text-slate-400 block">Preço</span>
                                                <span className="font-semibold text-slate-800 tabular-nums">
                                                    {formatCurrency(produto.preco)}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-slate-400 block">Estoque</span>
                                                <span
                                                    className={`font-semibold tabular-nums ${
                                                        isZerado
                                                            ? "text-red-600"
                                                            : isCritico
                                                              ? "text-amber-600"
                                                              : "text-slate-800"
                                                    }`}
                                                >
                                                    {produto.quantidade} / {produto.estoque_minimo} un
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100">
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                onClick={() => handleOpenEdit(produto)}
                                            >
                                                <Edit2 size={14} />
                                                <span>Editar</span>
                                            </Button>
                                            <Button
                                                variant="danger"
                                                size="sm"
                                                onClick={() => handleDelete(produto.id, produto.nome)}
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
                            totalItems={totalProdutos}
                            pageSize={itensPorPagina}
                            onPageChange={setPagina}
                            itemName="produtos"
                        />
                    </>
                )}
            </Card>

            <ProdutoFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                produtoToEdit={produtoToEdit}
                categorias={categorias}
                onSuccess={handleSuccess}
            />
        </div>
    );
}
