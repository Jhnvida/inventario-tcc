import { AlertCircle, Building2, User } from "lucide-react";
import { useEffect, useState, type ChangeEvent, type SubmitEvent } from "react";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Modal } from "../../components/ui/Modal";
import { useClientes } from "../../hooks/useClientes";
import type { Cliente } from "../../types";
import { formatCNPJ, formatCPF, formatTelefone, stripFormatting } from "../../utils/formatters";
import { validarCNPJ, validarCPF } from "../../utils/validators";

interface ClienteFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    clienteToEdit: Cliente | null;
    onSuccess: () => void;
}

export function ClienteFormModal({ isOpen, onClose, clienteToEdit, onSuccess }: ClienteFormModalProps) {
    const { createCliente, updateCliente } = useClientes();
    const isEditing = !!clienteToEdit;

    const [tipoPessoa, setTipoPessoa] = useState<"PF" | "PJ">("PF");
    const [formData, setFormData] = useState({
        nome: "",
        documento: "",
        email: "",
        telefone: "",
        cidade: "",
        estado: "",
        ativo: true,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (clienteToEdit) {
            setTipoPessoa(clienteToEdit.tipo_pessoa || "PF");
            setFormData({
                nome: clienteToEdit.nome,
                documento:
                    clienteToEdit.tipo_pessoa === "PJ"
                        ? formatCNPJ(clienteToEdit.documento)
                        : formatCPF(clienteToEdit.documento),
                email: clienteToEdit.email || "",
                telefone: formatTelefone(clienteToEdit.telefone),
                cidade: clienteToEdit.cidade || "",
                estado: clienteToEdit.estado || "",
                ativo: clienteToEdit.ativo,
            });
        } else {
            setTipoPessoa("PF");
            setFormData({
                nome: "",
                documento: "",
                email: "",
                telefone: "",
                cidade: "",
                estado: "",
                ativo: true,
            });
        }
        setError("");
    }, [clienteToEdit, isOpen]);

    function handleTipoPessoaChange(novoTipo: "PF" | "PJ") {
        if (novoTipo === tipoPessoa) return;
        setTipoPessoa(novoTipo);
        setFormData((prev) => ({
            ...prev,
            documento: "",
        }));
        setError("");
    }

    function handleChange(e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
        const { name, value, type } = e.target;

        if (type === "checkbox") {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData((prev) => ({ ...prev, [name]: checked }));
            return;
        }

        let formattedValue = value;
        if (name === "documento") {
            formattedValue = tipoPessoa === "PF" ? formatCPF(value) : formatCNPJ(value);
        } else if (name === "telefone") {
            formattedValue = formatTelefone(value);
        } else if (name === "estado") {
            formattedValue = value.toUpperCase().slice(0, 2);
        }

        setFormData((prev) => ({ ...prev, [name]: formattedValue }));
    }

    async function handleSubmit(e: SubmitEvent) {
        e.preventDefault();
        setError("");

        if (!formData.nome.trim()) {
            setError("O nome do cliente é obrigatório.");
            return;
        }

        const cleanDoc = stripFormatting(formData.documento);
        if (cleanDoc) {
            if (tipoPessoa === "PF" && !validarCPF(cleanDoc)) {
                setError("O CPF informado é inválido. Verifique os dígitos digitados.");
                return;
            }
            if (tipoPessoa === "PJ" && !validarCNPJ(cleanDoc)) {
                setError("O CNPJ informado é inválido. Verifique os dígitos digitados.");
                return;
            }
        }

        setLoading(true);

        const payload = {
            nome: formData.nome.trim(),
            tipo_pessoa: tipoPessoa,
            documento: cleanDoc || null,
            email: formData.email.trim() || null,
            telefone: stripFormatting(formData.telefone) || null,
            cidade: formData.cidade.trim() || null,
            estado: formData.estado.trim() || null,
            ativo: formData.ativo,
        };

        const res = isEditing ? await updateCliente(clienteToEdit.id, payload) : await createCliente(payload);

        if (res.success) {
            onSuccess();
        } else {
            setError(res.error || "Ocorreu um erro ao salvar o cliente.");
        }

        setLoading(false);
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={isEditing ? `Editar Cliente: ${clienteToEdit.nome}` : "Novo Cliente"}
            width="large"
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                    <div className="p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-2 animate-fade-in">
                        <AlertCircle size={15} className="shrink-0 text-red-600" />
                        <span>{error}</span>
                    </div>
                )}

                <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-700">Classificação Cadastral *</label>
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            type="button"
                            className={`flex items-center justify-center gap-2 h-9 rounded-md border text-xs font-medium active:scale-[0.98] transition-all duration-150 ease-out cursor-pointer ${
                                tipoPessoa === "PF"
                                    ? "bg-slate-900 text-white border-slate-900"
                                    : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                            }`}
                            onClick={() => handleTipoPessoaChange("PF")}
                        >
                            <User size={15} />
                            <span>Pessoa Física (CPF)</span>
                        </button>

                        <button
                            type="button"
                            className={`flex items-center justify-center gap-2 h-9 rounded-md border text-xs font-medium active:scale-[0.98] transition-all duration-150 ease-out cursor-pointer ${
                                tipoPessoa === "PJ"
                                    ? "bg-slate-900 text-white border-slate-900"
                                    : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                            }`}
                            onClick={() => handleTipoPessoaChange("PJ")}
                        >
                            <Building2 size={15} />
                            <span>Pessoa Jurídica (CNPJ)</span>
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                        label={tipoPessoa === "PJ" ? "Razão Social ou Nome Empresarial" : "Nome Completo"}
                        name="nome"
                        placeholder={tipoPessoa === "PJ" ? "Ex: Tech Solutions Ltda" : "Ex: Maria dos Santos"}
                        value={formData.nome}
                        onChange={handleChange}
                        required
                    />

                    <Input
                        label={tipoPessoa === "PJ" ? "CNPJ" : "CPF"}
                        name="documento"
                        placeholder={tipoPessoa === "PJ" ? "00.000.000/0000-00" : "000.000.000-00"}
                        value={formData.documento}
                        onChange={handleChange}
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                        label="E-mail de Contato"
                        name="email"
                        type="email"
                        placeholder="cliente@empresa.com"
                        value={formData.email}
                        onChange={handleChange}
                    />

                    <Input
                        label="Telefone / WhatsApp"
                        name="telefone"
                        placeholder="(00) 00000-0000"
                        value={formData.telefone}
                        onChange={handleChange}
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-2">
                        <Input
                            label="Cidade"
                            name="cidade"
                            placeholder="Ex: Ribeirão Preto"
                            value={formData.cidade}
                            onChange={handleChange}
                        />
                    </div>
                    <div>
                        <Input
                            label="Estado (UF)"
                            name="estado"
                            placeholder="SP"
                            maxLength={2}
                            value={formData.estado}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                    <input
                        type="checkbox"
                        id="cliente-ativo"
                        name="ativo"
                        checked={formData.ativo}
                        onChange={handleChange}
                        className="w-4 h-4 rounded-md border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                    <label htmlFor="cliente-ativo" className="text-sm font-medium text-slate-700 cursor-pointer">
                        Cliente ativo para emissão de novos pedidos de venda
                    </label>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                    <Button type="button" variant="secondary" onClick={onClose}>
                        Cancelar
                    </Button>
                    <Button type="submit" variant="primary" disabled={loading}>
                        {loading ? "Salvando..." : isEditing ? "Salvar Alterações" : "Cadastrar Cliente"}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
