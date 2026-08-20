import { Edit2, Plus, Search } from "lucide-react";
import { useState } from "react";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { useFornecedores } from "../../hooks/useFornecedores";
import type { Fornecedor } from "../../types";
import { FornecedorFormModal } from "./FornecedorFormModal";
import styles from "./styles.module.css";

export function Fornecedores() {
    const { fornecedores, loading, busca, setBusca, recarregar } = useFornecedores();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [fornecedorToEdit, setFornecedorToEdit] = useState<Fornecedor | null>(null);

    const handleOpenCreate = () => {
        setFornecedorToEdit(null);
        setIsModalOpen(true);
    };

    const handleOpenEdit = (fornecedor: Fornecedor) => {
        setFornecedorToEdit(fornecedor);
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
                    <h1 className={styles.title}>Fornecedores</h1>
                    <p className={styles.subtitle}>Gerencie a base de parceiros comerciais e distribuidores.</p>
                </div>
                <Button onClick={handleOpenCreate}>
                    <Plus size={18} />
                    Novo Fornecedor
                </Button>
            </header>

            <div className={styles.filter_grid}>
                <div className={styles.search_wrapper}>
                    <Search size={18} className={styles.search_icon} />
                    <Input
                        placeholder="Buscar por razão social, nome fantasia ou CNPJ..."
                        value={busca}
                        onChange={(e) => setBusca(e.target.value)}
                        className={styles.search_input}
                    />
                </div>
            </div>

            <div className={styles.table_container}>
                {loading ? (
                    <div className={styles.loading_state}>Carregando fornecedores...</div>
                ) : fornecedores.length === 0 ? (
                    <div className={styles.empty_state}>Nenhum fornecedor encontrado.</div>
                ) : (
                    <table className={styles.table}>
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
                        <tbody>
                            {fornecedores.map((fornecedor) => (
                                <tr key={fornecedor.id}>
                                    <td className={styles.fw500}>{fornecedor.razao_social}</td>
                                    <td className={styles.text_secondary}>{fornecedor.nome_fantasia || "-"}</td>
                                    <td>{fornecedor.cnpj}</td>
                                    <td className={styles.text_secondary}>
                                        {fornecedor.email || fornecedor.telefone || "-"}
                                    </td>
                                    <td>
                                        <Badge variant={fornecedor.status === "ativo" ? "success" : "neutral"}>
                                            {fornecedor.status}
                                        </Badge>
                                    </td>
                                    <td className={styles.text_center}>
                                        <Button
                                            variant="ghost"
                                            onClick={() => handleOpenEdit(fornecedor)}
                                            title="Editar"
                                        >
                                            <Edit2 size={16} />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
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
