import { Plus, Search } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { PageHeader } from "../../components/ui/PageHeader";
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

    function handleSuccess() {
        setIsModalOpen(false);
        recarregar();
    }

    return (
        <div className="page-container">
            <PageHeader title="Histórico de Movimentações" subtitle="Auditoria de entradas e saídas de estoque.">
                <Button onClick={() => setIsModalOpen(true)}>
                    <Plus size={18} style={{ marginRight: 8 }} />
                    Nova Movimentação
                </Button>
            </PageHeader>

            <div className="filter-grid">
                <div className="search-wrapper">
                    <Search size={18} className="search-icon" />
                    <Input
                        placeholder="Buscar por produto ou SKU..."
                        value={busca}
                        onChange={(e) => setBusca(e.target.value)}
                        className="search-input"
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

            <div className="table-container">
                {loading ? (
                    <div className="loading-state">Carregando histórico...</div>
                ) : movimentacoes.length === 0 ? (
                    <div className="empty-state">Nenhuma movimentação encontrada.</div>
                ) : (
                    <>
                        <table className="data-table hidden-mobile">
                            <thead>
                                <tr>
                                    <th>Tipo</th>
                                    <th>Produto</th>
                                    <th className="text-right">Qtd.</th>
                                    <th>Responsável</th>
                                    <th>Data</th>
                                </tr>
                            </thead>
                            <motion.tbody
                                initial="hidden"
                                animate="visible"
                                variants={{
                                    hidden: { opacity: 0 },
                                    visible: {
                                        opacity: 1,
                                        transition: { staggerChildren: 0.05 },
                                    },
                                }}
                            >
                                {movimentacoes.map((mov) => (
                                    <motion.tr
                                        key={mov.id}
                                        variants={{
                                            hidden: { opacity: 0, x: -10 },
                                            visible: { opacity: 1, x: 0 },
                                        }}
                                    >
                                        <td>
                                            <Badge variant={mov.tipo === "entrada" ? "success" : "critical"}>
                                                {mov.tipo === "entrada" ? "Entrada" : "Saída"}
                                            </Badge>
                                        </td>
                                        <td className="fw500">{mov.produtos?.nome || "-"}</td>
                                        <td
                                            className={`${mov.tipo === "entrada" ? styles.text_success : styles.text_danger} text-right fw600`}
                                        >
                                            {mov.tipo === "entrada" ? "+" : "-"}
                                            {mov.quantidade}
                                        </td>
                                        <td>{mov.usuarios?.nome || mov.usuarios?.email || "Sistema / Desconhecido"}</td>
                                        <td className="text-secondary">{formatDate(mov.criada_em)}</td>
                                    </motion.tr>
                                ))}
                            </motion.tbody>
                        </table>

                        <div className="mobile-cards-list mobile-only">
                            {movimentacoes.map((mov) => (
                                <div key={mov.id} className="mobile-card">
                                    <div className="mobile-card-header">
                                        <div className="mobile-card-title">{mov.produtos?.nome || "-"}</div>
                                        <Badge variant={mov.tipo === "entrada" ? "success" : "critical"}>
                                            {mov.tipo === "entrada" ? "Entrada" : "Saída"}
                                        </Badge>
                                    </div>
                                    <div className="mobile-card-body">
                                        <div className="mobile-card-row">
                                            <span className="mobile-card-label">Quantidade</span>
                                            <span
                                                className={`mobile-card-value ${mov.tipo === "entrada" ? styles.text_success : styles.text_danger}`}
                                            >
                                                {mov.tipo === "entrada" ? "+" : "-"}
                                                {mov.quantidade}
                                            </span>
                                        </div>
                                        <div className="mobile-card-row">
                                            <span className="mobile-card-label">Responsável</span>
                                            <span className="mobile-card-value">
                                                {mov.usuarios?.nome || mov.usuarios?.email || "Sistema"}
                                            </span>
                                        </div>
                                        <div className="mobile-card-row">
                                            <span className="mobile-card-label">Data</span>
                                            <span className="mobile-card-value">{formatDate(mov.criada_em)}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>

            <MovimentacaoFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                produtos={produtos}
                onSuccess={handleSuccess}
            />
        </div>
    );
}
