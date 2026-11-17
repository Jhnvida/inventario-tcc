import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { type Usuario, type UsuarioStatus } from "../types";
import { translateDbError } from "../utils/errors";

export type { Usuario, UsuarioStatus };

const ITENS_POR_PAGINA = 10;

export type FiltroStatusUsuario = "todos" | UsuarioStatus;

export function useUsuarios() {
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [totalUsuarios, setTotalUsuarios] = useState(0);
    const [totalPendentes, setTotalPendentes] = useState(0);
    const [pagina, setPagina] = useState(1);
    const [loading, setLoading] = useState(true);
    const [busca, setBusca] = useState("");
    const [filtroStatus, setFiltroStatus] = useState<FiltroStatusUsuario>("todos");

    const fetchTotalPendentes = useCallback(async () => {
        try {
            const { count, error } = await supabase
                .from("usuarios")
                .select("*", { count: "exact", head: true })
                .eq("status", "pendente");

            if (!error && count !== null) {
                setTotalPendentes(count);
            }
        } catch {
        }
    }, []);

    const fetchUsuarios = useCallback(
        async (paginaAlvo = pagina) => {
            try {
                setLoading(true);
                const from = (paginaAlvo - 1) * ITENS_POR_PAGINA;
                const to = from + ITENS_POR_PAGINA - 1;

                let query = supabase
                    .from("usuarios")
                    .select("*", { count: "exact" });

                if (filtroStatus !== "todos") {
                    query = query.eq("status", filtroStatus);
                }

                const term = busca.trim().replace(/"/g, "");
                if (term) {
                    query = query.or(`nome.ilike."%${term}%",email.ilike."%${term}%"`);
                }

                query = query
                    .order("criado_em", { ascending: false })
                    .range(from, to);

                const { data, count, error } = await query;

                if (error) throw error;

                const total = count ?? 0;
                setTotalUsuarios(total);

                const maxPaginas = Math.max(1, Math.ceil(total / ITENS_POR_PAGINA));
                if (paginaAlvo > maxPaginas && total > 0) {
                    setPagina(maxPaginas);
                    return;
                }

                setUsuarios((data as Usuario[]) || []);
            } catch (err: any) {
                console.error("Erro ao buscar usuários:", err.message);
            } finally {
                setLoading(false);
            }
        },
        [pagina, busca, filtroStatus],
    );

    useEffect(() => {
        fetchUsuarios(pagina);
        fetchTotalPendentes();
    }, [fetchUsuarios, fetchTotalPendentes, pagina]);

    const handleSetBusca = (novaBusca: string) => {
        setBusca(novaBusca);
        setPagina(1);
    };

    const handleSetFiltroStatus = (novoFiltro: FiltroStatusUsuario) => {
        setFiltroStatus(novoFiltro);
        setPagina(1);
    };

    async function updateUsuario(id: string, updates: Partial<Pick<Usuario, "nome" | "perfil" | "status">>) {
        try {
            const { error } = await supabase.from("usuarios").update(updates).eq("id", id);
            if (error) throw error;
            await Promise.all([fetchUsuarios(pagina), fetchTotalPendentes()]);
            return { success: true };
        } catch (error: any) {
            console.error("Erro ao atualizar usuário:", error);
            return { success: false, error: translateDbError(error) };
        }
    }

    async function aprovarUsuario(id: string) {
        return updateUsuario(id, { status: "ativo" });
    }

    async function recusarUsuario(id: string) {
        return updateUsuario(id, { status: "recusado" });
    }

    async function inativarUsuario(id: string) {
        return updateUsuario(id, { status: "inativo" });
    }

    async function deleteUsuario(id: string) {
        try {
            const { error } = await supabase.from("usuarios").delete().eq("id", id);
            if (error) throw error;
            await Promise.all([fetchUsuarios(pagina), fetchTotalPendentes()]);
            return { success: true };
        } catch (error: any) {
            console.error("Erro ao excluir usuário:", error);
            return { success: false, error: translateDbError(error) };
        }
    }

    return {
        usuarios,
        totalUsuarios,
        totalPendentes,
        pagina,
        setPagina,
        totalPaginas: Math.ceil(totalUsuarios / ITENS_POR_PAGINA),
        itensPorPagina: ITENS_POR_PAGINA,
        loading,
        busca,
        setBusca: handleSetBusca,
        filtroStatus,
        setFiltroStatus: handleSetFiltroStatus,
        recarregar: () => Promise.all([fetchUsuarios(pagina), fetchTotalPendentes()]),
        updateUsuario,
        aprovarUsuario,
        recusarUsuario,
        inativarUsuario,
        deleteUsuario,
    };
}
