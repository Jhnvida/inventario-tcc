import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { Fornecedor } from "../types";
import { translateDbError } from "../utils/errors";
import { stripFormatting } from "../utils/formatters";

const ITENS_POR_PAGINA = 10;

export function useFornecedores() {
    const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
    const [totalFornecedores, setTotalFornecedores] = useState(0);
    const [pagina, setPagina] = useState(1);
    const [loading, setLoading] = useState(true);
    const [busca, setBusca] = useState("");

    const fetchDados = useCallback(
        async (paginaAlvo = pagina) => {
            setLoading(true);
            try {
                const from = (paginaAlvo - 1) * ITENS_POR_PAGINA;
                const to = from + ITENS_POR_PAGINA - 1;

                let query = supabase.from("fornecedores").select("*", { count: "exact" });

                if (busca.trim()) {
                    const b = busca.trim();
                    const bNum = stripFormatting(b);
                    const orConds = [`razao_social.ilike.%${b}%`, `nome_fantasia.ilike.%${b}%`];
                    if (bNum) {
                        orConds.push(`cnpj.ilike.%${bNum}%`);
                    }
                    query = query.or(orConds.join(","));
                }

                query = query.order("razao_social", { ascending: true }).range(from, to);

                const { data, count, error } = await query;
                if (error) throw error;

                const total = count ?? 0;
                setTotalFornecedores(total);

                const maxPaginas = Math.max(1, Math.ceil(total / ITENS_POR_PAGINA));
                if (paginaAlvo > maxPaginas && total > 0) {
                    setPagina(maxPaginas);
                    return;
                }

                setFornecedores((data as Fornecedor[]) || []);
            } catch (error) {
                console.error("Erro ao buscar fornecedores:", error);
            } finally {
                setLoading(false);
            }
        },
        [pagina, busca],
    );

    useEffect(() => {
        fetchDados(pagina);
    }, [fetchDados, pagina]);

    const handleSetBusca = (novaBusca: string) => {
        setBusca(novaBusca);
        setPagina(1);
    };

    async function createFornecedor(fornecedor: Partial<Fornecedor>) {
        try {
            const { error } = await supabase.from("fornecedores").insert([fornecedor]);
            if (error) throw error;
            await fetchDados(pagina);
            return { success: true };
        } catch (error: any) {
            console.error("Erro ao criar fornecedor:", error);
            return { success: false, error: translateDbError(error) };
        }
    }

    async function updateFornecedor(id: string, fornecedor: Partial<Fornecedor>) {
        try {
            const { error } = await supabase.from("fornecedores").update(fornecedor).eq("id", id);
            if (error) throw error;
            await fetchDados(pagina);
            return { success: true };
        } catch (error: any) {
            console.error("Erro ao atualizar fornecedor:", error);
            return { success: false, error: translateDbError(error) };
        }
    }

    async function deleteFornecedor(id: string) {
        try {
            const { error } = await supabase.from("fornecedores").delete().eq("id", id);
            if (error) throw error;
            await fetchDados(pagina);
            return { success: true };
        } catch (error: any) {
            console.error("Erro ao excluir fornecedor:", error);
            return { success: false, error: translateDbError(error) };
        }
    }

    return {
        fornecedores,
        totalFornecedores,
        pagina,
        setPagina,
        totalPaginas: Math.ceil(totalFornecedores / ITENS_POR_PAGINA),
        itensPorPagina: ITENS_POR_PAGINA,
        loading,
        busca,
        setBusca: handleSetBusca,
        recarregar: () => fetchDados(pagina),
        createFornecedor,
        updateFornecedor,
        deleteFornecedor,
    };
}
