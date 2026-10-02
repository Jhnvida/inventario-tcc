import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export type Usuario = {
    id: string;
    nome: string;
    email: string;
    criado_em: string;
};

const ITENS_POR_PAGINA = 10;

export function useUsuarios() {
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [totalUsuarios, setTotalUsuarios] = useState(0);
    const [pagina, setPagina] = useState(1);
    const [loading, setLoading] = useState(true);

    const fetchUsuarios = useCallback(
        async (paginaAlvo = pagina) => {
            try {
                setLoading(true);
                const from = (paginaAlvo - 1) * ITENS_POR_PAGINA;
                const to = from + ITENS_POR_PAGINA - 1;

                const { data, count, error } = await supabase
                    .from("usuarios")
                    .select("*", { count: "exact" })
                    .order("nome")
                    .range(from, to);

                if (error) throw error;

                const total = count ?? 0;
                setTotalUsuarios(total);

                const maxPaginas = Math.max(1, Math.ceil(total / ITENS_POR_PAGINA));
                if (paginaAlvo > maxPaginas && total > 0) {
                    setPagina(maxPaginas);
                    return;
                }

                setUsuarios(data || []);
            } catch (err: any) {
                console.error("Erro ao buscar usuários:", err.message);
            } finally {
                setLoading(false);
            }
        },
        [pagina],
    );

    useEffect(() => {
        fetchUsuarios(pagina);
    }, [fetchUsuarios, pagina]);

    async function updateUsuario(id: string, updates: { nome?: string }) {
        try {
            const { error } = await supabase.from("usuarios").update(updates).eq("id", id);
            if (error) throw error;
            await fetchUsuarios(pagina);
            return { success: true };
        } catch (error: any) {
            console.error("Erro ao atualizar usuário:", error);
            return { success: false, error: error.message };
        }
    }

    async function deleteUsuario(id: string) {
        try {
            const { error } = await supabase.from("usuarios").delete().eq("id", id);
            if (error) throw error;
            await fetchUsuarios(pagina);
            return { success: true };
        } catch (error: any) {
            console.error("Erro ao excluir usuário:", error);
            return { success: false, error: error.message };
        }
    }

    return {
        usuarios,
        totalUsuarios,
        pagina,
        setPagina,
        totalPaginas: Math.ceil(totalUsuarios / ITENS_POR_PAGINA),
        itensPorPagina: ITENS_POR_PAGINA,
        loading,
        recarregar: () => fetchUsuarios(pagina),
        updateUsuario,
        deleteUsuario,
    };
}
