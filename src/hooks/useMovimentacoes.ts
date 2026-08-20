import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { Movimentacao, Produto } from "../types";

export type MovimentacaoComProduto = Movimentacao & { produtos: { nome: string; sku: string } | null };

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
                    .select("*, produtos(nome, sku)")
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
        const matchBusca =
            pNome.toLowerCase().includes(busca.toLowerCase()) || pSku.toLowerCase().includes(busca.toLowerCase());
        const matchTipo = tipoFiltro ? m.tipo === tipoFiltro : true;
        const matchProduto = produtoFiltro ? m.produto_id === produtoFiltro : true;

        return matchBusca && matchTipo && matchProduto;
    });

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
    };
}
