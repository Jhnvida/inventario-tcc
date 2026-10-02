import { Building2, User } from "lucide-react";
import { useEffect, useState, type ChangeEvent, type SubmitEvent } from "react";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Modal } from "../../components/ui/Modal";
import { useClientes } from "../../hooks/useClientes";
import type { Cliente } from "../../types";
import { formatCNPJ, formatCPF, formatTelefone, stripFormatting } from "../../utils/formatters";
import { validarCNPJ, validarCPF } from "../../utils/validators";
import styles from "./styles.module.css";

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

        const docLimpo = stripFormatting(formData.documento);
        if (docLimpo) {
            if (tipoPessoa === "PF") {
                if (!validarCPF(docLimpo)) {
                    setError("CPF inválido. Verifique os 11 dígitos informados.");
                    return;
                }
            } else {
                if (!validarCNPJ(docLimpo)) {
                    setError("CNPJ inválido. Verifique os 14 dígitos informados.");
                    return;
                }
            }
        }

        if (formData.email.trim()) {
            const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim());
            if (!emailValido) {
                setError("Informe um endereço de e-mail válido.");
                return;
            }
        }

        setLoading(true);

        const payload: Partial<Cliente> = {
            nome: formData.nome.trim(),
            tipo_pessoa: tipoPessoa,
            documento: docLimpo || null,
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
        <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? "Editar Cliente" : "Novo Cliente"} width="medium">
            <form onSubmit={handleSubmit} className={styles.form_container}>
                {error && <div className="alert-error">{error}</div>}

                <div className={styles.tipo_toggle_container}>
                    <span className={styles.tipo_toggle_label}>Tipo de Cadastro</span>
                    <div className={styles.tipo_toggle_group}>
                        <button
                            type="button"
                            className={`${styles.tipo_toggle_btn} ${tipoPessoa === "PF" ? styles.tipo_toggle_btn_active : ""}`}
                            onClick={() => handleTipoPessoaChange("PF")}
                        >
                            <User size={16} />
                            Pessoa Física
                        </button>
                        <button
                            type="button"
                            className={`${styles.tipo_toggle_btn} ${tipoPessoa === "PJ" ? styles.tipo_toggle_btn_active : ""}`}
                            onClick={() => handleTipoPessoaChange("PJ")}
                        >
                            <Building2 size={16} />
                            Pessoa Jurídica
                        </button>
                    </div>
                </div>

                <Input
                    label={tipoPessoa === "PF" ? "Nome Completo *" : "Razão Social / Nome Fantasia *"}
                    name="nome"
                    value={formData.nome}
                    onChange={handleChange}
                    placeholder={tipoPessoa === "PF" ? "Ex: João da Silva" : "Ex: Comércio e Serviços LTDA"}
                    required
                />

                <div className={styles.grid2}>
                    <Input
                        label={tipoPessoa === "PF" ? "CPF" : "CNPJ"}
                        name="documento"
                        value={formData.documento}
                        onChange={handleChange}
                        placeholder={tipoPessoa === "PF" ? "000.000.000-00" : "00.000.000/0000-00"}
                    />
                    <Input
                        label="Telefone / Celular"
                        name="telefone"
                        value={formData.telefone}
                        onChange={handleChange}
                        placeholder="(00) 00000-0000"
                    />
                </div>

                <Input
                    label="E-mail"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="cliente@exemplo.com"
                />

                <div className={styles.grid3}>
                    <Input
                        label="Cidade"
                        name="cidade"
                        value={formData.cidade}
                        onChange={handleChange}
                        placeholder="Ex: São Paulo"
                    />
                    <Input
                        label="Estado (UF)"
                        name="estado"
                        value={formData.estado}
                        onChange={handleChange}
                        placeholder="SP"
                        maxLength={2}
                    />
                    <div style={{ display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
                        <div className={styles.checkbox_wrapper}>
                            <input
                                type="checkbox"
                                id="cliente_ativo_checkbox"
                                name="ativo"
                                checked={formData.ativo}
                                onChange={handleChange}
                            />
                            <label htmlFor="cliente_ativo_checkbox" className={styles.checkbox_label}>
                                Cliente Ativo
                            </label>
                        </div>
                    </div>
                </div>

                <div className={styles.form_actions}>
                    <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
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
