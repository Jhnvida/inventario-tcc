import { Edit2, Plus, Search, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { PageHeader } from "../../components/ui/PageHeader";
import { useFornecedores } from "../../hooks/useFornecedores";
import type { Fornecedor } from "../../types";
import { formatCNPJ, formatTelefone } from "../../utils/formatters";
import { FornecedorFormModal } from "./FornecedorFormModal";
import styles from "./styles.module.css";

export function Fornecedores() {
    const { fornecedores, loading, busca, setBusca, recarregar, deleteFornecedor } = useFornecedores();

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
        <div className="page-container">
            <PageHeader title="Fornecedores" subtitle="Gerencie a base de parceiros comerciais e distribuidores.">
                <Button onClick={handleOpenCreate}>
                    <Plus size={18} style={{ marginRight: 8 }} />
                    Novo Fornecedor
                </Button>
            </PageHeader>

            <div className="filter-grid">
                <div className="search-wrapper">
                    <Search size={18} className="search-icon" />
                    <Input
                        placeholder="Buscar por razão social, nome fantasia ou CNPJ..."
                        value={busca}
                        onChange={(e) => setBusca(e.target.value)}
                        className="search-input"
                    />
                </div>
            </div>

            <div className="table-container">
                {loading ? (
                    <div className="loading-state">Carregando fornecedores...</div>
                ) : fornecedores.length === 0 ? (
                    <div className="empty-state">Nenhum fornecedor encontrado.</div>
                ) : (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Fornecedor</th>
                                <th>CNPJ</th>
                                <th>Contato</th>
                                <th className={styles.text_center}>Ações</th>
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
                            {fornecedores.map((fornecedor) => (
                                <motion.tr
                                    key={fornecedor.id}
                                    variants={{
                                        hidden: { opacity: 0, x: -10 },
                                        visible: { opacity: 1, x: 0 },
                                    }}
                                >
                                    <td>
                                        <div className="fw500">{fornecedor.razao_social}</div>
                                        <div className="text-secondary" style={{ fontSize: "0.85em" }}>
                                            {fornecedor.nome_fantasia || "Sem nome fantasia"}
                                        </div>
                                    </td>
                                    <td>{formatCNPJ(fornecedor.cnpj)}</td>
                                    <td className="text-secondary">
                                        {fornecedor.email ||
                                            (fornecedor.telefone ? formatTelefone(fornecedor.telefone) : "-")}
                                    </td>
                                    <td
                                        className="text-center"
                                        style={{ display: "flex", gap: "8px", justifyContent: "center" }}
                                    >
                                        <Button
                                            variant="ghost"
                                            onClick={() => handleOpenEdit(fornecedor)}
                                            title="Editar"
                                        >
                                            <Edit2 size={16} />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            onClick={() => handleDelete(fornecedor.id, fornecedor.razao_social)}
                                            title="Excluir"
                                            className={styles.danger_icon}
                                            style={{ color: "var(--color-danger-text)" }}
                                        >
                                            <Trash2 size={16} />
                                        </Button>
                                    </td>
                                </motion.tr>
                            ))}
                        </motion.tbody>
                    </table>
                )}
            </div>

            <FornecedorFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                fornecedorToEdit={fornecedorToEdit}
                onSuccess={handleSuccess}
            />
        </div>
    );
}
