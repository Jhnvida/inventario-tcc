import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { Categoria, Produto } from "../types";

export type ProdutoComCategoria = Produto & { categorias: { id: string; nome: string } | null };

export function useProdutos() {
    const [produtos, setProdutos] = useState<ProdutoComCategoria[]>([]);
    const [categorias, setCategorias] = useState<Categoria[]>([]);
    const [loading, setLoading] = useState(true);

    const [busca, setBusca] = useState("");
    const [categoriaFiltro, setCategoriaFiltro] = useState("");

    async function fetchDados() {
        setLoading(true);
        try {
            const [prodRes, catRes] = await Promise.all([
                supabase.from("produtos").select("*, categorias(id, nome)").order("criado_em", { ascending: false }),
                supabase.from("categorias").select("*").order("nome"),
            ]);

            if (prodRes.data) setProdutos(prodRes.data as ProdutoComCategoria[]);
            if (catRes.data) setCategorias(catRes.data as Categoria[]);
        } catch (error) {
            console.error("Erro ao buscar produtos:", error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchDados();
    }, []);

    const produtosFiltrados = produtos.filter((p) => {
        const matchBusca =
            p.nome.toLowerCase().includes(busca.toLowerCase()) || p.sku.toLowerCase().includes(busca.toLowerCase());
        const matchCategoria = categoriaFiltro ? p.categoria_id === categoriaFiltro : true;
        return matchBusca && matchCategoria;
    });

    async function createProduto(produto: Partial<Produto>) {
        try {
            const { data: newProd, error: insertError } = await supabase
                .from("produtos")
                .insert([produto])
                .select("id")
                .single();

            if (insertError) throw insertError;

            // Se houver saldo inicial, dispara a movimentação
            if (newProd && produto.quantidade && produto.quantidade > 0) {
                const { error: movError } = await supabase.rpc("registrar_movimentacao", {
                    p_produto_id: newProd.id,
                    p_tipo: "entrada",
                    p_quantidade: produto.quantidade,
                    p_responsavel: "Administrador",
                    p_motivo: "Saldo inicial de cadastro",
                });
                if (movError) console.error("Erro ao registrar mov inicial:", movError);
            }
            await fetchDados();
            return { success: true };
        } catch (error: any) {
            console.error("Erro ao criar produto:", error);
            return { success: false, error: error.message };
        }
    }

    async function updateProduto(id: string, produto: Partial<Produto>) {
        try {
            const { error: updateError } = await supabase
                .from("produtos")
                .update({ ...produto, atualizado_em: new Date().toISOString() })
                .eq("id", id);

            if (updateError) throw updateError;
            await fetchDados();
            return { success: true };
        } catch (error: any) {
            console.error("Erro ao atualizar produto:", error);
            return { success: false, error: error.message };
        }
    }

    async function deleteProduto(id: string) {
        try {
            const { error } = await supabase.from("produtos").delete().eq("id", id);
            if (error) throw error;
            await fetchDados();
            return { success: true };
        } catch (error: any) {
            console.error("Erro ao excluir produto:", error);
            return { success: false, error: error.message };
        }
    }

    return {
        produtos: produtosFiltrados,
        categorias,
        loading,
        busca,
        setBusca,
        categoriaFiltro,
        setCategoriaFiltro,
        recarregar: fetchDados,
        createProduto,
        updateProduto,
        deleteProduto,
    };
}
