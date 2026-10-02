import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { Categoria, Produto } from "../types";
import { translateDbError } from "../utils/errors";

export type ProdutoComCategoria = Produto & { categorias: { id: string; nome: string } | null };

const ITENS_POR_PAGINA = 10;

export function useProdutos() {
    const [produtos, setProdutos] = useState<ProdutoComCategoria[]>([]);
    const [categorias, setCategorias] = useState<Categoria[]>([]);
    const [totalProdutos, setTotalProdutos] = useState(0);
    const [pagina, setPagina] = useState(1);
    const [loading, setLoading] = useState(true);

    const [busca, setBusca] = useState("");
    const [categoriaFiltro, setCategoriaFiltro] = useState("");

    const fetchCategorias = useCallback(async () => {
        try {
            const { data } = await supabase.from("categorias").select("*").order("nome");
            if (data) setCategorias(data as Categoria[]);
        } catch (error) {
            console.error("Erro ao buscar categorias:", error);
        }
    }, []);

    const fetchDados = useCallback(
        async (paginaAlvo = pagina) => {
            setLoading(true);
            try {
                const from = (paginaAlvo - 1) * ITENS_POR_PAGINA;
                const to = from + ITENS_POR_PAGINA - 1;

                let query = supabase.from("produtos").select("*, categorias(id, nome)", { count: "exact" });

                if (categoriaFiltro) {
                    query = query.eq("categoria_id", categoriaFiltro);
                }
                if (busca.trim()) {
                    query = query.or(`nome.ilike.%${busca.trim()}%,sku.ilike.%${busca.trim()}%`);
                }

                query = query.order("criado_em", { ascending: false }).range(from, to);

                const { data, count, error } = await query;
                if (error) throw error;

                const total = count ?? 0;
                setTotalProdutos(total);

                const maxPaginas = Math.max(1, Math.ceil(total / ITENS_POR_PAGINA));
                if (paginaAlvo > maxPaginas && total > 0) {
                    setPagina(maxPaginas);
                    return;
                }

                setProdutos((data as ProdutoComCategoria[]) || []);
            } catch (error) {
                console.error("Erro ao buscar produtos:", error);
            } finally {
                setLoading(false);
            }
        },
        [pagina, busca, categoriaFiltro],
    );

    useEffect(() => {
        fetchCategorias();
    }, [fetchCategorias]);

    useEffect(() => {
        fetchDados(pagina);
    }, [fetchDados, pagina]);

    const handleSetBusca = (novaBusca: string) => {
        setBusca(novaBusca);
        setPagina(1);
    };

    const handleSetCategoriaFiltro = (novaCategoria: string) => {
        setCategoriaFiltro(novaCategoria);
        setPagina(1);
    };

    async function createProduto(produto: Partial<Produto>) {
        try {
            const { data: newProd, error: insertError } = await supabase
                .from("produtos")
                .insert([produto])
                .select("id")
                .single();

            if (insertError) throw insertError;

            if (newProd && produto.quantidade && produto.quantidade > 0) {
                const {
                    data: { user: currentUser },
                } = await supabase.auth.getUser();

                const { error: movError } = await supabase.rpc("registrar_movimentacao", {
                    p_produto_id: newProd.id,
                    p_tipo: "entrada",
                    p_quantidade: produto.quantidade,
                    p_usuario_id: currentUser?.id || null,
                    p_motivo: "Saldo inicial de cadastro",
                });

                if (movError) console.error("Erro ao registrar mov inicial:", movError);
            }

            await fetchDados(pagina);
            return { success: true };
        } catch (error: any) {
            console.error("Erro ao criar produto:", error);
            return { success: false, error: translateDbError(error) };
        }
    }

    async function updateProduto(id: string, produto: Partial<Produto>) {
        try {
            const { error: updateError } = await supabase
                .from("produtos")
                .update({ ...produto, atualizado_em: new Date().toISOString() })
                .eq("id", id);

            if (updateError) throw updateError;
            await fetchDados(pagina);
            return { success: true };
        } catch (error: any) {
            console.error("Erro ao atualizar produto:", error);
            return { success: false, error: translateDbError(error) };
        }
    }

    async function deleteProduto(id: string) {
        try {
            const { error } = await supabase.from("produtos").delete().eq("id", id);
            if (error) throw error;
            await fetchDados(pagina);
            return { success: true };
        } catch (error: any) {
            console.error("Erro ao excluir produto:", error);
            return { success: false, error: translateDbError(error) };
        }
    }

    return {
        produtos,
        categorias,
        loading,
        busca,
        setBusca: handleSetBusca,
        categoriaFiltro,
        setCategoriaFiltro: handleSetCategoriaFiltro,
        pagina,
        setPagina,
        totalProdutos,
        totalPaginas: Math.ceil(totalProdutos / ITENS_POR_PAGINA),
        itensPorPagina: ITENS_POR_PAGINA,
        recarregar: () => fetchDados(pagina),
        createProduto,
        updateProduto,
        deleteProduto,
    };
}
