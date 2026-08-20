import { useEffect, useState } from "react";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Modal } from "../../components/ui/Modal";
import { Select } from "../../components/ui/Select";
import { supabase } from "../../lib/supabase";
import type { Fornecedor } from "../../types";

interface FornecedorFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    fornecedorToEdit: Fornecedor | null;
    onSuccess: () => void;
}

export function FornecedorFormModal({ isOpen, onClose, fornecedorToEdit, onSuccess }: FornecedorFormModalProps) {
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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            if (isEditing) {
                const { error: updateError } = await supabase
                    .from("fornecedores")
                    .update(formData)
                    .eq("id", fornecedorToEdit.id);

                if (updateError) throw updateError;
            } else {
                const { error: insertError } = await supabase.from("fornecedores").insert([formData]);

                if (insertError) throw insertError;
            }
            onSuccess();
        } catch (err: any) {
            setError(err.message || "Ocorreu um erro ao salvar o fornecedor.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={isEditing ? "Editar Fornecedor" : "Novo Fornecedor"}
            width="medium"
        >
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                {error && (
                    <div
                        style={{
                            padding: "1rem",
                            backgroundColor: "var(--status-critical-bg)",
                            color: "var(--status-critical-text)",
                            borderRadius: "8px",
                        }}
                    >
                        {error}
                    </div>
                )}

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

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
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

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
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

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem", marginTop: "1rem" }}>
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
