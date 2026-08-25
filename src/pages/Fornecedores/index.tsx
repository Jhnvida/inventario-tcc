import { Edit2, Plus, Search } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { PageHeader } from "../../components/ui/PageHeader";
import { useFornecedores } from "../../hooks/useFornecedores";
import type { Fornecedor } from "../../types";
import { FornecedorFormModal } from "./FornecedorFormModal";
import styles from "./styles.module.css";

export function Fornecedores() {
    const { fornecedores, loading, busca, setBusca, recarregar } = useFornecedores();

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
                                <th>Razão Social</th>
                                <th>Nome Fantasia</th>
                                <th>CNPJ</th>
                                <th>Contato</th>
                                <th>Status</th>
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
                                    <td className="fw500">{fornecedor.razao_social}</td>
                                    <td className="text-secondary">{fornecedor.nome_fantasia || "-"}</td>
                                    <td>{fornecedor.cnpj}</td>
                                    <td className="text-secondary">{fornecedor.email || fornecedor.telefone || "-"}</td>
                                    <td>
                                        <Badge variant={fornecedor.status === "ativo" ? "success" : "neutral"}>
                                            {fornecedor.status}
                                        </Badge>
                                    </td>
                                    <td className="text-center">
                                        <Button
                                            variant="ghost"
                                            onClick={() => handleOpenEdit(fornecedor)}
                                            title="Editar"
                                        >
                                            <Edit2 size={16} />
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
