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

    return {
        produtos: produtosFiltrados,
        categorias,
        loading,
        busca,
        setBusca,
        categoriaFiltro,
        setCategoriaFiltro,
        recarregar: fetchDados,
    };
}
