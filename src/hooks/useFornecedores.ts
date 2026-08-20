import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { Fornecedor } from "../types";

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
        const text = `${f.razao_social} ${f.nome_fantasia || ""} ${f.cnpj}`.toLowerCase();
        return text.includes(busca.toLowerCase());
    });

    return {
        fornecedores: fornecedoresFiltrados,
        loading,
        busca,
        setBusca,
        recarregar: fetchDados,
    };
}
