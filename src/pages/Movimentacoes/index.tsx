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

    const handleSuccess = () => {
        setIsModalOpen(false);
        recarregar();
    };

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
                    <table className="data-table">
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
                                    <td className="text-secondary">
                                        <div>{formatDate(mov.criada_em)}</div>
                                        <div style={{ fontSize: "0.85em", marginTop: "2px" }}>
                                            {new Date(mov.criada_em).toLocaleTimeString([], {
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                        </motion.tbody>
                    </table>
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
