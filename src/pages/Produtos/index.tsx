import { Edit2, Plus, Search } from "lucide-react";
import { useState } from "react";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { useProdutos, type ProdutoComCategoria } from "../../hooks/useProdutos";
import type { Produto } from "../../types";
import { formatCurrency } from "../../utils/formatters";
import { ProdutoFormModal } from "./ProdutoFormModal";
import styles from "./styles.module.css";

export function Produtos() {
    const { produtos, categorias, loading, busca, setBusca, categoriaFiltro, setCategoriaFiltro, recarregar } =
        useProdutos();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [produtoToEdit, setProdutoToEdit] = useState<Produto | null>(null);

    const handleOpenCreate = () => {
        setProdutoToEdit(null);
        setIsModalOpen(true);
    };

    const handleOpenEdit = (produto: ProdutoComCategoria) => {
        setProdutoToEdit(produto);
        setIsModalOpen(true);
    };

    const handleSuccess = () => {
        setIsModalOpen(false);
        recarregar();
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div>
                    <h1 className={styles.title}>Produtos</h1>
                    <p className={styles.subtitle}>Gerencie o catálogo de produtos e seus níveis de estoque.</p>
                </div>
                <Button onClick={handleOpenCreate}>
                    <Plus size={18} />
                    Novo Produto
                </Button>
            </header>

            <div className={styles.filter_grid}>
                <div className={styles.search_wrapper}>
                    <Search size={18} className={styles.search_icon} />
                    <Input
                        placeholder="Buscar por nome ou SKU..."
                        value={busca}
                        onChange={(e) => setBusca(e.target.value)}
                        className={styles.search_input}
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

            <div className={styles.table_container}>
                {loading ? (
                    <div className={styles.loading_state}>Carregando produtos...</div>
                ) : produtos.length === 0 ? (
                    <div className={styles.empty_state}>Nenhum produto encontrado.</div>
                ) : (
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Produto</th>
                                <th>SKU</th>
                                <th>Categoria</th>
                                <th>Preço Un.</th>
                                <th className={styles.text_right}>Estoque</th>
                                <th className={styles.text_center}>Status</th>
                                <th className={styles.text_center}>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {produtos.map((produto) => {
                                const isCritico = produto.quantidade <= produto.estoque_minimo;
                                return (
                                    <tr key={produto.id}>
                                        <td className={styles.fw500}>{produto.nome}</td>
                                        <td className={styles.text_monospace}>{produto.sku}</td>
                                        <td className={styles.text_secondary}>
                                            {produto.categorias?.nome || "Sem Categoria"}
                                        </td>
                                        <td>{formatCurrency(produto.preco)}</td>
                                        <td className={`${styles.text_right} ${styles.fw600}`}>{produto.quantidade}</td>
                                        <td className={styles.text_center}>
                                            <Badge variant={isCritico ? "critical" : "success"}>
                                                {isCritico ? "Crítico" : "Normal"}
                                            </Badge>
                                        </td>
                                        <td className={styles.text_center}>
                                            <Button
                                                variant="ghost"
                                                onClick={() => handleOpenEdit(produto)}
                                                title="Editar"
                                            >
                                                <Edit2 size={16} />
                                            </Button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
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
