import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { Categoria } from "../types";
import { translateDbError } from "../utils/errors";

const ITENS_POR_PAGINA = 10;

export function useCategorias() {
    const [categorias, setCategorias] = useState<Categoria[]>([]);
    const [totalCategorias, setTotalCategorias] = useState(0);
    const [pagina, setPagina] = useState(1);
    const [loading, setLoading] = useState(true);

    const fetchCategorias = useCallback(
        async (paginaAlvo = pagina) => {
            try {
                setLoading(true);
                const from = (paginaAlvo - 1) * ITENS_POR_PAGINA;
                const to = from + ITENS_POR_PAGINA - 1;

                const { data, count, error } = await supabase
                    .from("categorias")
                    .select("*", { count: "exact" })
                    .order("nome")
                    .range(from, to);

                if (error) throw error;

                const total = count ?? 0;
                setTotalCategorias(total);

                const maxPaginas = Math.max(1, Math.ceil(total / ITENS_POR_PAGINA));
                if (paginaAlvo > maxPaginas && total > 0) {
                    setPagina(maxPaginas);
                    return;
                }

                setCategorias(data || []);
            } catch (err: any) {
                console.error("Erro ao buscar categorias:", err.message);
            } finally {
                setLoading(false);
            }
        },
        [pagina],
    );

    useEffect(() => {
        fetchCategorias(pagina);
    }, [fetchCategorias, pagina]);

    async function deleteCategoria(id: string) {
        try {
            const { error } = await supabase.from("categorias").delete().eq("id", id);
            if (error) throw error;
            await fetchCategorias(pagina);
            return { success: true };
        } catch (error: any) {
            console.error("Erro ao excluir categoria:", error);
            return { success: false, error: translateDbError(error) };
        }
    }

    async function createCategoria(nome: string) {
        try {
            const { error } = await supabase.from("categorias").insert([{ nome: nome.trim() }]);
            if (error) throw error;
            await fetchCategorias(pagina);
            return { success: true };
        } catch (error: any) {
            console.error("Erro ao criar categoria:", error);
            return { success: false, error: translateDbError(error) };
        }
    }

    async function updateCategoria(id: string, nome: string) {
        try {
            const { error } = await supabase.from("categorias").update({ nome: nome.trim() }).eq("id", id);
            if (error) throw error;
            await fetchCategorias(pagina);
            return { success: true };
        } catch (error: any) {
            console.error("Erro ao atualizar categoria:", error);
            return { success: false, error: translateDbError(error) };
        }
    }

    return {
        categorias,
        totalCategorias,
        pagina,
        setPagina,
        totalPaginas: Math.ceil(totalCategorias / ITENS_POR_PAGINA),
        itensPorPagina: ITENS_POR_PAGINA,
        loading,
        recarregar: () => fetchCategorias(pagina),
        deleteCategoria,
        createCategoria,
        updateCategoria,
    };
}
