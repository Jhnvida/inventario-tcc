import { useState, type ChangeEvent, type SubmitEvent } from "react";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Modal } from "../../components/ui/Modal";
import { Select } from "../../components/ui/Select";
import { supabase } from "../../lib/supabase";
import type { Produto } from "../../types";
import styles from "./styles.module.css";

interface MovimentacaoFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    produtos: Produto[];
    onSuccess: () => void;
}

export function MovimentacaoFormModal({ isOpen, onClose, produtos, onSuccess }: MovimentacaoFormModalProps) {
    const [formData, setFormData] = useState({
        produto_id: "",
        tipo: "entrada",
        quantidade: 0,
        motivo: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === "quantidade" ? Number(value) : value,
        }));
    };

    const handleSubmit = async (e: SubmitEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            if (formData.quantidade <= 0) {
                throw new Error("A quantidade deve ser maior que zero.");
            }
            if (!formData.produto_id) {
                throw new Error("Selecione um produto.");
            }

            // Chama a procedure no banco de dados para garantir transação ACID
            const { error: rpcError } = await supabase.rpc("registrar_movimentacao", {
                p_produto_id: formData.produto_id,
                p_tipo: formData.tipo,
                p_quantidade: formData.quantidade,
                p_responsavel: "Administrador", // Simulação do usuário logado
                p_motivo: formData.motivo,
            });

            if (rpcError) throw rpcError;

            onSuccess();
            setFormData({ produto_id: "", tipo: "entrada", quantidade: 0, motivo: "" });
        } catch (err: any) {
            setError(err.message || "Ocorreu um erro ao registrar a movimentação.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Nova Movimentação Manual" width="medium">
            <form onSubmit={handleSubmit} className={styles.form_container}>
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

                <Select label="Produto" name="produto_id" value={formData.produto_id} onChange={handleChange} required>
                    <option value="">Selecione um produto...</option>
                    {produtos.map((p) => (
                        <option key={p.id} value={p.id}>
                            {p.nome} ({p.sku})
                        </option>
                    ))}
                </Select>

                <div className={styles.grid2}>
                    <Select
                        label="Tipo de Movimentação"
                        name="tipo"
                        value={formData.tipo}
                        onChange={handleChange}
                        required
                    >
                        <option value="entrada">Entrada</option>
                        <option value="saida">Saída</option>
                    </Select>

                    <Input
                        label="Quantidade"
                        name="quantidade"
                        type="number"
                        min="1"
                        value={formData.quantidade}
                        onChange={handleChange}
                        required
                    />
                </div>

                <Input
                    label="Motivo (Opcional)"
                    name="motivo"
                    value={formData.motivo}
                    onChange={handleChange}
                    placeholder="Ex: Ajuste de inventário, Devolução..."
                />

                <div className={styles.form_actions}>
                    <Button type="button" variant="ghost" onClick={onClose}>
                        Cancelar
                    </Button>
                    <Button type="submit" variant="primary" disabled={loading}>
                        {loading ? "Registrando..." : "Registrar Movimentação"}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
