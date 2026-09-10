import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { Fornecedor } from "../types";
import { stripFormatting } from "../utils/formatters";

export function useFornecedores() {
    const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
    const [loading, setLoading] = useState(true);
    const [busca, setBusca] = useState("");

    async function fetchDados() {
        setLoading(true);
        try {
            const { data } = await supabase.from("fornecedores").select("*").order("razao_social", { ascending: true });

            if (data) setFornecedores(data as Fornecedor[]);
        } catch (error) {
            console.error("Erro ao buscar fornecedores:", error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchDados();
    }, []);

    const fornecedoresFiltrados = fornecedores.filter((f) => {
        const searchRaw = busca.toLowerCase();
        const searchStripped = stripFormatting(busca);

        const matchText = `${f.razao_social} ${f.nome_fantasia || ""}`.toLowerCase().includes(searchRaw);
        const matchCnpj = searchStripped ? f.cnpj.includes(searchStripped) : false;

        return matchText || matchCnpj;
    });

    async function createFornecedor(fornecedor: Partial<Fornecedor>) {
        try {
            const { error } = await supabase.from("fornecedores").insert([fornecedor]);
            if (error) throw error;
            await fetchDados();
            return { success: true };
        } catch (error: any) {
            console.error("Erro ao criar fornecedor:", error);
            return { success: false, error: error.message };
        }
    }

    async function updateFornecedor(id: string, fornecedor: Partial<Fornecedor>) {
        try {
            const { error } = await supabase.from("fornecedores").update(fornecedor).eq("id", id);
            if (error) throw error;
            await fetchDados();
            return { success: true };
        } catch (error: any) {
            console.error("Erro ao atualizar fornecedor:", error);
            return { success: false, error: error.message };
        }
    }

    async function deleteFornecedor(id: string) {
        try {
            const { error } = await supabase.from("fornecedores").delete().eq("id", id);
            if (error) throw error;
            await fetchDados();
            return { success: true };
        } catch (error: any) {
            console.error("Erro ao excluir fornecedor:", error);
            return { success: false, error: error.message };
        }
    }

    return {
        fornecedores: fornecedoresFiltrados,
        loading,
        busca,
        setBusca,
        recarregar: fetchDados,
        createFornecedor,
        updateFornecedor,
        deleteFornecedor,
    };
}
