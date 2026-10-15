import { AlertCircle, ArrowDownRight, ArrowUpRight } from "lucide-react";
import { useEffect, useState, type ChangeEvent, type SubmitEvent } from "react";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Modal } from "../../components/ui/Modal";
import { Select } from "../../components/ui/Select";
import { useAuth } from "../../contexts/AuthContext";
import { useMovimentacoes } from "../../hooks/useMovimentacoes";
import type { Produto } from "../../types";

interface MovimentacaoFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    produtos: Produto[];
    onSuccess: () => void;
    initialProdutoId?: string;
}

export function MovimentacaoFormModal({
    isOpen,
    onClose,
    produtos,
    onSuccess,
    initialProdutoId,
}: MovimentacaoFormModalProps) {
    const { createMovimentacao } = useMovimentacoes();
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        produto_id: initialProdutoId || "",
        tipo: "entrada",
        quantidade: 0,
        motivo: initialProdutoId ? "Reposição de estoque crítico" : "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (isOpen) {
            setFormData({
                produto_id: initialProdutoId || "",
                tipo: "entrada",
                quantidade: 0,
                motivo: initialProdutoId ? "Reposição de estoque crítico" : "",
            });
            setError("");
        }
    }, [isOpen, initialProdutoId]);

    function handleChange(e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === "quantidade" ? Number(value) : value,
        }));
    }

    async function handleSubmit(e: SubmitEvent) {
        e.preventDefault();
        setLoading(true);
        setError("");

        if (!formData.produto_id) {
            setError("Selecione um produto.");
            setLoading(false);
            return;
        }

        if (formData.quantidade <= 0) {
            setError("A quantidade deve ser maior que zero.");
            setLoading(false);
            return;
        }

        const res = await createMovimentacao({
            produto_id: formData.produto_id,
            tipo: formData.tipo,
            quantidade: formData.quantidade,
            usuario_id: user?.id,
            motivo: formData.motivo,
        });

        if (res.success) {
            onSuccess();
            setFormData({ produto_id: "", tipo: "entrada", quantidade: 0, motivo: "" });
        } else {
            setError(res.error || "Ocorreu um erro ao registrar a movimentação.");
        }

        setLoading(false);
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Nova Movimentação Manual" width="medium">
            <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                    <div className="p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-2">
                        <AlertCircle size={15} className="shrink-0 text-red-600" />
                        <span>{error}</span>
                    </div>
                )}

                <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-700">Tipo de Operação *</label>
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            type="button"
                            className={`flex items-center justify-center gap-2 h-9 rounded-md border text-xs font-medium transition-colors cursor-pointer ${
                                formData.tipo === "entrada"
                                    ? "bg-slate-900 text-white border-slate-900"
                                    : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                            }`}
                            onClick={() => setFormData((prev) => ({ ...prev, tipo: "entrada" }))}
                        >
                            <ArrowUpRight size={15} />
                            <span>Entrada (+ Estoque)</span>
                        </button>

                        <button
                            type="button"
                            className={`flex items-center justify-center gap-2 h-9 rounded-md border text-xs font-medium transition-colors cursor-pointer ${
                                formData.tipo === "saida"
                                    ? "bg-slate-900 text-white border-slate-900"
                                    : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                            }`}
                            onClick={() => setFormData((prev) => ({ ...prev, tipo: "saida" }))}
                        >
                            <ArrowDownRight size={15} />
                            <span>Saída (- Estoque)</span>
                        </button>
                    </div>
                </div>

                <Select label="Produto" name="produto_id" value={formData.produto_id} onChange={handleChange} required>
                    <option value="">Selecione um produto...</option>
                    {produtos.map((p) => (
                        <option key={p.id} value={p.id}>
                            {p.nome} ({p.sku}) — Atual: {p.quantidade} un
                        </option>
                    ))}
                </Select>

                <Input
                    label="Quantidade Movimentada"
                    name="quantidade"
                    type="number"
                    min="1"
                    placeholder="Ex: 10"
                    value={formData.quantidade || ""}
                    onChange={handleChange}
                    required
                />

                <Input
                    label="Motivo ou Justificativa (Opcional)"
                    name="motivo"
                    value={formData.motivo}
                    onChange={handleChange}
                    placeholder="Ex: Ajuste de inventário, reposição crítica, devolução..."
                />

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                    <Button type="button" variant="secondary" onClick={onClose}>
                        Cancelar
                    </Button>
                    <Button type="submit" variant="primary" disabled={loading}>
                        {loading ? "Registrando..." : "Confirmar Movimentação"}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
