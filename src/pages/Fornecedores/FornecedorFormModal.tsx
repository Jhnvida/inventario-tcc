import { useEffect, useState, type ChangeEvent, type SubmitEvent } from "react";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Modal } from "../../components/ui/Modal";
import { Select } from "../../components/ui/Select";
import { useFornecedores } from "../../hooks/useFornecedores";
import type { Fornecedor } from "../../types";
import styles from "./styles.module.css";

interface FornecedorFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    fornecedorToEdit: Fornecedor | null;
    onSuccess: () => void;
}

export function FornecedorFormModal({ isOpen, onClose, fornecedorToEdit, onSuccess }: FornecedorFormModalProps) {
    const { createFornecedor, updateFornecedor } = useFornecedores();
    const isEditing = !!fornecedorToEdit;

    const [formData, setFormData] = useState({
        razao_social: "",
        nome_fantasia: "",
        cnpj: "",
        telefone: "",
        email: "",
        status: "ativo" as "ativo" | "inativo",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (fornecedorToEdit) {
            setFormData({
                razao_social: fornecedorToEdit.razao_social,
                nome_fantasia: fornecedorToEdit.nome_fantasia || "",
                cnpj: fornecedorToEdit.cnpj,
                telefone: fornecedorToEdit.telefone || "",
                email: fornecedorToEdit.email || "",
                status: fornecedorToEdit.status,
            });
        } else {
            setFormData({
                razao_social: "",
                nome_fantasia: "",
                cnpj: "",
                telefone: "",
                email: "",
                status: "ativo",
            });
        }
        setError("");
    }, [fornecedorToEdit, isOpen]);

    function handleChange(e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    }

    async function handleSubmit(e: SubmitEvent) {
        e.preventDefault();
        setLoading(true);
        setError("");

        const res = isEditing
            ? await updateFornecedor(fornecedorToEdit.id, formData)
            : await createFornecedor(formData);

        if (res.success) {
            onSuccess();
        } else {
            setError(res.error || "Ocorreu um erro ao salvar o fornecedor.");
        }

        setLoading(false);
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={isEditing ? "Editar Fornecedor" : "Novo Fornecedor"}
            width="medium"
        >
            <form onSubmit={handleSubmit} className={styles.form_container}>
                {error && <div className="alert-error">{error}</div>}

                <Input
                    label="Razão Social"
                    name="razao_social"
                    value={formData.razao_social}
                    onChange={handleChange}
                    required
                />

                <Input
                    label="Nome Fantasia (Opcional)"
                    name="nome_fantasia"
                    value={formData.nome_fantasia}
                    onChange={handleChange}
                />

                <div className={styles.grid2}>
                    <Input
                        label="CNPJ"
                        name="cnpj"
                        value={formData.cnpj}
                        onChange={handleChange}
                        required
                        placeholder="00.000.000/0001-00"
                    />
                    <Select label="Status" name="status" value={formData.status} onChange={handleChange} required>
                        <option value="ativo">Ativo</option>
                        <option value="inativo">Inativo</option>
                    </Select>
                </div>

                <div className={styles.grid2}>
                    <Input
                        label="E-mail (Opcional)"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                    />
                    <Input
                        label="Telefone (Opcional)"
                        name="telefone"
                        value={formData.telefone}
                        onChange={handleChange}
                    />
                </div>

                <div className={styles.form_actions}>
                    <Button type="button" variant="ghost" onClick={onClose}>
                        Cancelar
                    </Button>
                    <Button type="submit" variant="primary" disabled={loading}>
                        {loading ? "Salvando..." : "Salvar Fornecedor"}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
