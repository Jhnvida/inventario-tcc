import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { Movimentacao, Produto } from "../types";
import { translateDbError } from "../utils/errors";

export type MovimentacaoComProduto = Movimentacao & {
    produtos: { nome: string; sku: string } | null;
    usuarios: { nome: string; email: string } | null;
};

const ITENS_POR_PAGINA = 10;

export function useMovimentacoes() {
    const [movimentacoes, setMovimentacoes] = useState<MovimentacaoComProduto[]>([]);
    const [produtos, setProdutos] = useState<Produto[]>([]);
    const [totalMovimentacoes, setTotalMovimentacoes] = useState(0);
    const [pagina, setPagina] = useState(1);
    const [loading, setLoading] = useState(true);

    const [busca, setBusca] = useState("");
    const [tipoFiltro, setTipoFiltro] = useState("");
    const [produtoFiltro, setProdutoFiltro] = useState("");

    const fetchProdutos = useCallback(async () => {
        try {
            const { data } = await supabase.from("produtos").select("id, nome, sku").order("nome");
            if (data) setProdutos(data as Produto[]);
        } catch (error) {
            console.error("Erro ao buscar lista de produtos para filtro:", error);
        }
    }, []);

    const fetchDados = useCallback(
        async (paginaAlvo = pagina) => {
            setLoading(true);
            try {
                const from = (paginaAlvo - 1) * ITENS_POR_PAGINA;
                const to = from + ITENS_POR_PAGINA - 1;

                const selectQuery = busca.trim()
                    ? "*, produtos!inner(nome, sku), usuarios(nome, email)"
                    : "*, produtos(nome, sku), usuarios(nome, email)";

                let query = supabase.from("movimentacoes").select(selectQuery, { count: "exact" });

                if (tipoFiltro) {
                    query = query.eq("tipo", tipoFiltro);
                }

                if (produtoFiltro) {
                    query = query.eq("produto_id", produtoFiltro);
                }

                if (busca.trim()) {
                    const b = busca.trim();
                    query = query.or(`nome.ilike.%${b}%,sku.ilike.%${b}%`, { foreignTable: "produtos" });
                }

                query = query.order("criada_em", { ascending: false }).range(from, to);

                const { data, count, error } = await query;
                if (error) throw error;

                const total = count ?? 0;
                setTotalMovimentacoes(total);

                const maxPaginas = Math.max(1, Math.ceil(total / ITENS_POR_PAGINA));
                if (paginaAlvo > maxPaginas && total > 0) {
                    setPagina(maxPaginas);
                    return;
                }

                setMovimentacoes((data as unknown as MovimentacaoComProduto[]) || []);
            } catch (error) {
                console.error("Erro ao buscar movimentações:", error);
            } finally {
                setLoading(false);
            }
        },
        [pagina, busca, tipoFiltro, produtoFiltro],
    );

    useEffect(() => {
        fetchProdutos();
    }, [fetchProdutos]);

    useEffect(() => {
        fetchDados(pagina);
    }, [fetchDados, pagina]);

    const handleSetBusca = (novaBusca: string) => {
        setBusca(novaBusca);
        setPagina(1);
    };

    const handleSetTipoFiltro = (novoTipo: string) => {
        setTipoFiltro(novoTipo);
        setPagina(1);
    };

    const handleSetProdutoFiltro = (novoProduto: string) => {
        setProdutoFiltro(novoProduto);
        setPagina(1);
    };

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
            await fetchDados(pagina);
            return { success: true };
        } catch (error: any) {
            console.error("Erro ao registrar movimentação:", error);
            return { success: false, error: translateDbError(error) };
        }
    }

    return {
        movimentacoes,
        produtos,
        totalMovimentacoes,
        pagina,
        setPagina,
        totalPaginas: Math.ceil(totalMovimentacoes / ITENS_POR_PAGINA),
        itensPorPagina: ITENS_POR_PAGINA,
        loading,
        busca,
        setBusca: handleSetBusca,
        tipoFiltro,
        setTipoFiltro: handleSetTipoFiltro,
        produtoFiltro,
        setProdutoFiltro: handleSetProdutoFiltro,
        recarregar: () => fetchDados(pagina),
        createMovimentacao,
    };
}
