import { Edit2, Plus, Search, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { PageHeader } from "../../components/ui/PageHeader";
import { Select } from "../../components/ui/Select";
import { useProdutos, type ProdutoComCategoria } from "../../hooks/useProdutos";
import type { Produto } from "../../types";
import { formatCurrency } from "../../utils/formatters";
import { ProdutoFormModal } from "./ProdutoFormModal";
import styles from "./styles.module.css";

export function Produtos() {
    const {
        produtos,
        categorias,
        loading,
        busca,
        setBusca,
        categoriaFiltro,
        setCategoriaFiltro,
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
        <div className="page-container">
            <PageHeader title="Produtos" subtitle="Gerencie o catálogo de produtos e seus níveis de estoque.">
                <Button onClick={handleOpenCreate}>
                    <Plus size={18} style={{ marginRight: 8 }} />
                    Novo Produto
                </Button>
            </PageHeader>

            <div className="filter-grid">
                <div className="search-wrapper">
                    <Search size={18} className="search-icon" />
                    <Input
                        placeholder="Buscar por nome ou SKU..."
                        value={busca}
                        onChange={(e) => setBusca(e.target.value)}
                        className="search-input"
                    />
                </div>
                <div>
                    <Select value={categoriaFiltro} onChange={(e) => setCategoriaFiltro(e.target.value)}>
                        <option value="">Todas as categorias</option>
                        {categorias.map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.nome}
                            </option>
                        ))}
                    </Select>
                </div>
            </div>

            <div className="table-container">
                {loading ? (
                    <div className="loading-state">Carregando produtos...</div>
                ) : produtos.length === 0 ? (
                    <div className="empty-state">Nenhum produto encontrado.</div>
                ) : (
                    <>
                        <table className="data-table hidden-mobile">
                            <thead>
                                <tr>
                                    <th>Produto</th>
                                    <th>SKU</th>
                                    <th>Categoria</th>
                                    <th>Preço Un.</th>
                                    <th className="text-right">Estoque</th>
                                    <th className="text-center">Ações</th>
                                </tr>
                            </thead>
                            <motion.tbody
                                initial="hidden"
                                animate="visible"
                                variants={{
                                    hidden: { opacity: 0 },
                                    visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
                                }}
                            >
                                {produtos.map((produto) => {
                                    const isCritico = produto.quantidade <= produto.estoque_minimo;
                                    return (
                                        <motion.tr
                                            key={produto.id}
                                            variants={{
                                                hidden: { opacity: 0, x: -10 },
                                                visible: { opacity: 1, x: 0 },
                                            }}
                                        >
                                            <td className="fw500">{produto.nome}</td>
                                            <td className="text-monospace">{produto.sku}</td>
                                            <td className="text-secondary">
                                                {produto.categorias?.nome || "Sem Categoria"}
                                            </td>
                                            <td>{formatCurrency(produto.preco)}</td>
                                            <td className="text-right">
                                                <span
                                                    className="fw600"
                                                    style={isCritico ? { color: "var(--color-danger-text)" } : {}}
                                                >
                                                    {produto.quantidade}
                                                </span>
                                            </td>
                                            <td
                                                className="text-center"
                                                style={{ display: "flex", gap: "8px", justifyContent: "center" }}
                                            >
                                                <Button
                                                    variant="ghost"
                                                    onClick={() => handleOpenEdit(produto)}
                                                    title="Editar"
                                                >
                                                    <Edit2 size={16} />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    onClick={() => handleDelete(produto.id, produto.nome)}
                                                    title="Excluir"
                                                    className={styles.danger_icon}
                                                    style={{ color: "var(--color-danger-text)" }}
                                                >
                                                    <Trash2 size={16} />
                                                </Button>
                                            </td>
                                        </motion.tr>
                                    );
                                })}
                            </motion.tbody>
                        </table>

                        <div className="mobile-cards-list mobile-only">
                            {produtos.map((produto) => {
                                const isCritico = produto.quantidade <= produto.estoque_minimo;
                                return (
                                    <div key={produto.id} className="mobile-card">
                                        <div className="mobile-card-header">
                                            <div>
                                                <div className="mobile-card-title">{produto.nome}</div>
                                                <div className="mobile-card-subtitle">{produto.sku}</div>
                                            </div>
                                            {isCritico && (
                                                <span
                                                    style={{
                                                        fontSize: "12px",
                                                        color: "var(--color-danger-text)",
                                                        fontWeight: 600,
                                                    }}
                                                >
                                                    Crítico
                                                </span>
                                            )}
                                        </div>
                                        <div className="mobile-card-body">
                                            <div className="mobile-card-row">
                                                <span className="mobile-card-label">Categoria</span>
                                                <span className="mobile-card-value">
                                                    {produto.categorias?.nome || "Sem Categoria"}
                                                </span>
                                            </div>
                                            <div className="mobile-card-row">
                                                <span className="mobile-card-label">Preço</span>
                                                <span className="mobile-card-value">
                                                    {formatCurrency(produto.preco)}
                                                </span>
                                            </div>
                                            <div className="mobile-card-row">
                                                <span className="mobile-card-label">Estoque</span>
                                                <span
                                                    className="mobile-card-value"
                                                    style={isCritico ? { color: "var(--color-danger-text)" } : {}}
                                                >
                                                    {produto.quantidade}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="mobile-card-actions">
                                            <Button
                                                variant="ghost"
                                                onClick={() => handleOpenEdit(produto)}
                                                title="Editar"
                                            >
                                                <Edit2 size={16} />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                onClick={() => handleDelete(produto.id, produto.nome)}
                                                title="Excluir"
                                                className={styles.danger_icon}
                                                style={{ color: "var(--color-danger-text)" }}
                                            >
                                                <Trash2 size={16} />
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}
            </div>

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
