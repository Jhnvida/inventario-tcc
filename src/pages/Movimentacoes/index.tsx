import { Plus, Search } from "lucide-react";
import { useState } from "react";
import { Button } from "../../components/ui/Button";
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
                    <h1 className={styles.title}>Histórico de Movimentações</h1>
                    <p className={styles.subtitle}>Auditoria de entradas e saídas de estoque.</p>
                </div>
                <Button onClick={() => setIsModalOpen(true)}>
                    <Plus size={18} />
                    Nova Movimentação
                </Button>
            </header>

            <div className={styles.filter_grid}>
                <div className={styles.search_wrapper}>
                    <Search size={18} className={styles.search_icon} />
                    <Input
                        placeholder="Buscar por produto ou SKU..."
                        value={busca}
                        onChange={(e) => setBusca(e.target.value)}
                        className={styles.search_input}
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

            <div className={styles.table_container}>
                {loading ? (
                    <div className={styles.loading_state}>Carregando histórico...</div>
                ) : movimentacoes.length === 0 ? (
                    <div className={styles.empty_state}>Nenhuma movimentação encontrada.</div>
                ) : (
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Tipo</th>
                                <th>Produto</th>
                                <th className={styles.text_right}>Qtd.</th>
                                <th>Responsável</th>
                                <th>Motivo</th>
                                <th>Data e Hora</th>
                            </tr>
                        </thead>
                        <tbody>
                            {movimentacoes.map((mov) => (
                                <tr key={mov.id}>
                                    <td>
                                        <div className={styles.flex_center_gap8}>
                                            <div
                                                style={{
                                                    width: "8px",
                                                    height: "8px",
                                                    borderRadius: "50%",
                                                    backgroundColor:
                                                        mov.tipo === "entrada"
                                                            ? "var(--color-success-text)"
                                                            : "var(--color-danger-text)",
                                                }}
                                            ></div>
                                            <span className={styles.text_capitalize_fw500}>{mov.tipo}</span>
                                        </div>
                                    </td>
                                    <td className={styles.fw500}>{mov.produtos?.nome || "-"}</td>
                                    <td
                                        className={`${mov.tipo === "entrada" ? styles.text_success : styles.text_danger} ${styles.text_right} ${styles.fw600}`}
                                    >
                                        {mov.tipo === "entrada" ? "+" : "-"}
                                        {mov.quantidade}
                                    </td>
                                    <td>{mov.responsavel}</td>
                                    <td className={styles.text_secondary}>{mov.motivo || "-"}</td>
                                    <td className={styles.text_secondary}>{formatDate(mov.criada_em)}</td>
                                </tr>
                            ))}
                        </tbody>
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
