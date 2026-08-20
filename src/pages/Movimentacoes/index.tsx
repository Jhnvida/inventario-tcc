import { Plus, Search } from "lucide-react";
import { useState } from "react";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { useMovimentacoes } from "../../hooks/useMovimentacoes";
import { formatDate } from "../../utils/formatters";
import { MovimentacaoFormModal } from "./MovimentacaoFormModal";
import styles from "./styles.module.css";

export function Movimentacoes() {
    const {
        movimentacoes,
        produtos,
        loading,
        busca,
        setBusca,
        tipoFiltro,
        setTipoFiltro,
        produtoFiltro,
        setProdutoFiltro,
        recarregar,
    } = useMovimentacoes();

    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleSuccess = () => {
        setIsModalOpen(false);
        recarregar();
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div>
                    <h1 className={styles.title}>Movimentações de Estoque</h1>
                    <p className={styles.subtitle}>Histórico completo de entradas e saídas.</p>
                </div>
                <Button onClick={() => setIsModalOpen(true)}>
                    <Plus size={18} />
                    Nova Movimentação
                </Button>
            </header>

            <Card className={styles.filterCard}>
                <div className={styles.filterGrid}>
                    <div className={styles.searchWrapper}>
                        <Search className={styles.searchIcon} size={18} />
                        <Input
                            placeholder="Buscar por produto ou SKU..."
                            value={busca}
                            onChange={(e) => setBusca(e.target.value)}
                            className={styles.searchInput}
                        />
                    </div>
                    <div>
                        <Select value={produtoFiltro} onChange={(e) => setProdutoFiltro(e.target.value)}>
                            <option value="">Todos os produtos</option>
                            {produtos.map((p) => (
                                <option key={p.id} value={p.id}>
                                    {p.nome}
                                </option>
                            ))}
                        </Select>
                    </div>
                    <div>
                        <Select value={tipoFiltro} onChange={(e) => setTipoFiltro(e.target.value)}>
                            <option value="">Todos os tipos</option>
                            <option value="entrada">Entradas</option>
                            <option value="saida">Saídas</option>
                        </Select>
                    </div>
                </div>
            </Card>

            <Card padding="none" className={styles.tableCard}>
                <div className={styles.tableContainer}>
                    {loading ? (
                        <div className={styles.emptyState}>Carregando histórico...</div>
                    ) : movimentacoes.length === 0 ? (
                        <div className={styles.emptyState}>Nenhuma movimentação encontrada.</div>
                    ) : (
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Data / Hora</th>
                                    <th>Produto</th>
                                    <th>SKU</th>
                                    <th>Tipo</th>
                                    <th style={{ textAlign: "right" }}>Quantidade</th>
                                    <th>Responsável</th>
                                    <th>Motivo</th>
                                </tr>
                            </thead>
                            <tbody>
                                {movimentacoes.map((mov) => (
                                    <tr key={mov.id}>
                                        <td className={styles.textSecondary}>{formatDate(mov.criada_em)}</td>
                                        <td className={styles.fw500}>{mov.produtos?.nome || "-"}</td>
                                        <td className={styles.textSecondary}>{mov.produtos?.sku || "-"}</td>
                                        <td>
                                            <Badge variant={mov.tipo === "entrada" ? "success" : "critical"}>
                                                {mov.tipo}
                                            </Badge>
                                        </td>
                                        <td style={{ textAlign: "right", fontWeight: 600 }}>
                                            {mov.tipo === "entrada" ? "+" : "-"}
                                            {mov.quantidade}
                                        </td>
                                        <td className={styles.textSecondary}>{mov.responsavel}</td>
                                        <td className={styles.textSecondary}>{mov.motivo || "-"}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </Card>

            <MovimentacaoFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                produtos={produtos}
                onSuccess={handleSuccess}
            />
        </div>
    );
}
