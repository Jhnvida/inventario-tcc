import { AlertCircle } from "lucide-react";
import { useEffect, useState, type ChangeEvent, type SubmitEvent } from "react";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Modal } from "../../components/ui/Modal";
import { useFornecedores } from "../../hooks/useFornecedores";
import type { Fornecedor } from "../../types";
import { formatCNPJ, formatTelefone, stripFormatting } from "../../utils/formatters";
import { validarCNPJ } from "../../utils/validators";

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
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (fornecedorToEdit) {
            setFormData({
                razao_social: fornecedorToEdit.razao_social,
                nome_fantasia: fornecedorToEdit.nome_fantasia || "",
                cnpj: formatCNPJ(fornecedorToEdit.cnpj),
                telefone: formatTelefone(fornecedorToEdit.telefone),
                email: fornecedorToEdit.email || "",
            });
        } else {
            setFormData({
                razao_social: "",
                nome_fantasia: "",
                cnpj: "",
                telefone: "",
                email: "",
            });
        }
        setError("");
    }, [fornecedorToEdit, isOpen]);

    function handleChange(e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
        const { name, value } = e.target;

        let formattedValue = value;
        if (name === "cnpj") {
            formattedValue = formatCNPJ(value);
        } else if (name === "telefone") {
            formattedValue = formatTelefone(value);
        }

        setFormData((prev) => ({ ...prev, [name]: formattedValue }));
    }

    async function handleSubmit(e: SubmitEvent) {
        e.preventDefault();
        setError("");

        if (!formData.razao_social.trim()) {
            setError("A razão social é obrigatória.");
            return;
        }

        const cleanCnpj = stripFormatting(formData.cnpj);
        if (cleanCnpj && !validarCNPJ(cleanCnpj)) {
            setError("O CNPJ informado é inválido. Verifique os números digitados.");
            return;
        }

        setLoading(true);

        const payload = {
            razao_social: formData.razao_social.trim(),
            nome_fantasia: formData.nome_fantasia.trim() || null,
            cnpj: cleanCnpj,
            telefone: stripFormatting(formData.telefone) || null,
            email: formData.email.trim() || null,
        };

        const res = isEditing ? await updateFornecedor(fornecedorToEdit.id, payload) : await createFornecedor(payload);

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
            title={isEditing ? `Editar Fornecedor: ${fornecedorToEdit.razao_social}` : "Novo Fornecedor"}
            width="medium"
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                    <div className="p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-2">
                        <AlertCircle size={15} className="shrink-0 text-red-600" />
                        <span>{error}</span>
                    </div>
                )}

                <div className="space-y-4">
                    <Input
                        label="Razão Social"
                        name="razao_social"
                        placeholder="Ex: Distribuidora Nacional de Peças Ltda"
                        value={formData.razao_social}
                        onChange={handleChange}
                        required
                    />

                    <Input
                        label="Nome Fantasia"
                        name="nome_fantasia"
                        placeholder="Ex: AutoPeças Nacional"
                        value={formData.nome_fantasia}
                        onChange={handleChange}
                    />

                    <Input
                        label="CNPJ"
                        name="cnpj"
                        placeholder="00.000.000/0000-00"
                        value={formData.cnpj}
                        onChange={handleChange}
                        required
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input
                            label="Telefone Comercial"
                            name="telefone"
                            placeholder="(00) 0000-0000"
                            value={formData.telefone}
                            onChange={handleChange}
                        />

                        <Input
                            label="E-mail de Contato"
                            name="email"
                            type="email"
                            placeholder="pedidos@fornecedor.com"
                            value={formData.email}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                    <Button type="button" variant="secondary" onClick={onClose}>
                        Cancelar
                    </Button>
                    <Button type="submit" variant="primary" disabled={loading}>
                        {loading ? "Salvando..." : isEditing ? "Salvar Alterações" : "Cadastrar Fornecedor"}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
