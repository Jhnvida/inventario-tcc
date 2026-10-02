import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { Cliente } from "../types";
import { translateDbError } from "../utils/errors";
import { stripFormatting } from "../utils/formatters";

export type FiltroStatusCliente = "todos" | "ativos" | "inativos";
export type FiltroTipoCliente = "todos" | "PF" | "PJ";

const ITENS_POR_PAGINA = 10;

export function useClientes() {
    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [totalClientes, setTotalClientes] = useState(0);
    const [pagina, setPagina] = useState(1);
    const [loading, setLoading] = useState(true);

    const [busca, setBusca] = useState("");
    const [filtroStatus, setFiltroStatus] = useState<FiltroStatusCliente>("todos");
    const [filtroTipo, setFiltroTipo] = useState<FiltroTipoCliente>("todos");

    const fetchDados = useCallback(
        async (paginaAlvo = pagina) => {
            setLoading(true);

            try {
                const from = (paginaAlvo - 1) * ITENS_POR_PAGINA;
                const to = from + ITENS_POR_PAGINA - 1;

                let query = supabase.from("clientes").select("*", { count: "exact" });

                if (filtroStatus === "ativos") {
                    query = query.eq("ativo", true);
                } else if (filtroStatus === "inativos") {
                    query = query.eq("ativo", false);
                }

                if (filtroTipo !== "todos") {
                    query = query.eq("tipo_pessoa", filtroTipo);
                }

                if (busca.trim()) {
                    const b = busca.trim();
                    const bNum = stripFormatting(b);
                    const orConds = [`nome.ilike.%${b}%`, `email.ilike.%${b}%`, `cidade.ilike.%${b}%`];
                    if (bNum) {
                        orConds.push(`documento.ilike.%${bNum}%`);
                    }
                    query = query.or(orConds.join(","));
                }

                query = query.order("nome", { ascending: true }).range(from, to);

                const { data, count, error } = await query;
                if (error) throw error;

                const total = count ?? 0;
                setTotalClientes(total);

                const maxPaginas = Math.max(1, Math.ceil(total / ITENS_POR_PAGINA));
                if (paginaAlvo > maxPaginas && total > 0) {
                    setPagina(maxPaginas);
                    return;
                }

                setClientes((data as Cliente[]) || []);
            } catch (error) {
                console.error("Erro ao buscar clientes:", error);
            } finally {
                setLoading(false);
            }
        },
        [pagina, busca, filtroStatus, filtroTipo],
    );

    useEffect(() => {
        fetchDados(pagina);
    }, [fetchDados, pagina]);

    const handleSetBusca = (novaBusca: string) => {
        setBusca(novaBusca);
        setPagina(1);
    };

    const handleSetFiltroStatus = (novoStatus: FiltroStatusCliente) => {
        setFiltroStatus(novoStatus);
        setPagina(1);
    };

    const handleSetFiltroTipo = (novoTipo: FiltroTipoCliente) => {
        setFiltroTipo(novoTipo);
        setPagina(1);
    };

    async function createCliente(clienteData: Partial<Cliente>) {
        try {
            const payload = {
                ...clienteData,
                documento: clienteData.documento ? stripFormatting(clienteData.documento) : null,
                telefone: clienteData.telefone ? stripFormatting(clienteData.telefone) : null,
                estado: clienteData.estado ? clienteData.estado.toUpperCase().slice(0, 2) : null,
            };

            const { error } = await supabase.from("clientes").insert([payload]);
            if (error) throw error;

            await fetchDados(pagina);
            return { success: true };
        } catch (error: any) {
            console.error("Erro ao cadastrar cliente:", error);
            return { success: false, error: translateDbError(error) };
        }
    }

    async function updateCliente(id: string, clienteData: Partial<Cliente>) {
        try {
            const payload = {
                ...clienteData,
                documento: clienteData.documento ? stripFormatting(clienteData.documento) : null,
                telefone: clienteData.telefone ? stripFormatting(clienteData.telefone) : null,
                estado: clienteData.estado ? clienteData.estado.toUpperCase().slice(0, 2) : null,
            };

            const { error } = await supabase.from("clientes").update(payload).eq("id", id);
            if (error) throw error;

            await fetchDados(pagina);
            return { success: true };
        } catch (error: any) {
            console.error("Erro ao atualizar cliente:", error);
            return { success: false, error: translateDbError(error) };
        }
    }

    async function toggleStatusCliente(id: string, statusAtual: boolean) {
        try {
            const { error } = await supabase.from("clientes").update({ ativo: !statusAtual }).eq("id", id);

            if (error) throw error;
            await fetchDados(pagina);
            return { success: true };
        } catch (error: any) {
            console.error("Erro ao alternar status do cliente:", error);
            return { success: false, error: translateDbError(error) };
        }
    }

    async function deleteCliente(id: string) {
        try {
            const { error } = await supabase.from("clientes").delete().eq("id", id);
            if (error) {
                if (error.code === "23503") {
                    return {
                        success: false,
                        error: "Este cliente possui histórico de vendas vinculado e não pode ser excluído. Em vez disso, altere a situação dele para 'Inativo'.",
                    };
                }
                throw error;
            }

            await fetchDados(pagina);
            return { success: true };
        } catch (error: any) {
            console.error("Erro ao excluir cliente:", error);
            return { success: false, error: translateDbError(error) };
        }
    }

    return {
        clientes,
        totalClientes,
        pagina,
        setPagina,
        totalPaginas: Math.ceil(totalClientes / ITENS_POR_PAGINA),
        itensPorPagina: ITENS_POR_PAGINA,
        loading,
        busca,
        setBusca: handleSetBusca,
        filtroStatus,
        setFiltroStatus: handleSetFiltroStatus,
        filtroTipo,
        setFiltroTipo: handleSetFiltroTipo,
        recarregar: () => fetchDados(pagina),
        createCliente,
        updateCliente,
        toggleStatusCliente,
        deleteCliente,
    };
}
