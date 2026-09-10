import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { Movimentacao, Produto } from "../types";
import { translateDbError } from "../utils/errors";

export type MovimentacaoComProduto = Movimentacao & {
    produtos: { nome: string; sku: string } | null;
    usuarios: { nome: string; email: string } | null;
};

export function useMovimentacoes() {
    const [movimentacoes, setMovimentacoes] = useState<MovimentacaoComProduto[]>([]);
    const [produtos, setProdutos] = useState<Produto[]>([]);
    const [loading, setLoading] = useState(true);

    const [busca, setBusca] = useState("");
    const [tipoFiltro, setTipoFiltro] = useState("");
    const [produtoFiltro, setProdutoFiltro] = useState("");

    async function fetchDados() {
        setLoading(true);
        try {
            const [movsRes, prodRes] = await Promise.all([
                supabase
                    .from("movimentacoes")
                    .select("*, produtos(nome, sku), usuarios(nome, email)")
                    .order("criada_em", { ascending: false }),
                supabase.from("produtos").select("id, nome, sku").order("nome"),
            ]);

            if (movsRes.data) setMovimentacoes(movsRes.data as unknown as MovimentacaoComProduto[]);
            if (prodRes.data) setProdutos(prodRes.data as Produto[]);
        } catch (error) {
            console.error("Erro ao buscar movimentações:", error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchDados();
    }, []);

    const movimentacoesFiltradas = movimentacoes.filter((m) => {
        const pNome = m.produtos?.nome || "";
        const pSku = m.produtos?.sku || "";
        const uNome = m.usuarios?.nome || "";
        const uEmail = m.usuarios?.email || "";
        const matchBusca =
            pNome.toLowerCase().includes(busca.toLowerCase()) ||
            pSku.toLowerCase().includes(busca.toLowerCase()) ||
            uNome.toLowerCase().includes(busca.toLowerCase()) ||
            uEmail.toLowerCase().includes(busca.toLowerCase());
        const matchTipo = tipoFiltro ? m.tipo === tipoFiltro : true;
        const matchProduto = produtoFiltro ? m.produto_id === produtoFiltro : true;

        return matchBusca && matchTipo && matchProduto;
    });

    async function createMovimentacao(data: {
        produto_id: string;
        tipo: string;
        quantidade: number;
        motivo?: string;
        usuario_id?: string;
    }) {
        try {
            if (data.quantidade <= 0) {
                throw new Error("A quantidade deve ser maior que zero.");
            }
            if (!data.produto_id) {
                throw new Error("Selecione um produto.");
            }

            const { error: rpcError } = await supabase.rpc("registrar_movimentacao", {
                p_produto_id: data.produto_id,
                p_tipo: data.tipo,
                p_quantidade: data.quantidade,
                p_usuario_id: data.usuario_id || null,
                p_motivo: data.motivo || null,
            });

            if (rpcError) throw rpcError;
            await fetchDados();
            return { success: true };
        } catch (error: any) {
            console.error("Erro ao registrar movimentação:", error);
            return { success: false, error: translateDbError(error) };
        }
    }

    return {
        movimentacoes: movimentacoesFiltradas,
        produtos,
        loading,
        busca,
        setBusca,
        tipoFiltro,
        setTipoFiltro,
        produtoFiltro,
        setProdutoFiltro,
        recarregar: fetchDados,
        createMovimentacao,
    };
}
