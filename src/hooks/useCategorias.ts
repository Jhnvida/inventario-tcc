import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { Categoria } from "../types";

export function useCategorias() {
    const [categorias, setCategorias] = useState<Categoria[]>([]);
    const [loading, setLoading] = useState(true);

    async function fetchCategorias() {
        try {
            setLoading(true);
            const { data, error } = await supabase.from("categorias").select("*").order("nome");

            if (error) throw error;
            setCategorias(data || []);
        } catch (err: any) {
            console.error("Erro ao buscar categorias:", err.message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchCategorias();
    }, []);

    async function deleteCategoria(id: string) {
        try {
            const { error } = await supabase.from("categorias").delete().eq("id", id);
            if (error) throw error;
            await fetchCategorias();
            return { success: true };
        } catch (error: any) {
            console.error("Erro ao excluir categoria:", error);
            return { success: false, error: error.message };
        }
    }

    async function createCategoria(nome: string) {
        try {
            const { error } = await supabase.from("categorias").insert([{ nome: nome.trim() }]);
            if (error) throw error;
            await fetchCategorias();
            return { success: true };
        } catch (error: any) {
            console.error("Erro ao criar categoria:", error);
            return { success: false, error: error.message };
        }
    }

    async function updateCategoria(id: string, nome: string) {
        try {
            const { error } = await supabase.from("categorias").update({ nome: nome.trim() }).eq("id", id);
            if (error) throw error;
            await fetchCategorias();
            return { success: true };
        } catch (error: any) {
            console.error("Erro ao atualizar categoria:", error);
            return { success: false, error: error.message };
        }
    }

    return { categorias, loading, recarregar: fetchCategorias, deleteCategoria, createCategoria, updateCategoria };
}
