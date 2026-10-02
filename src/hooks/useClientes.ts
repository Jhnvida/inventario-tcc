import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { Cliente } from "../types";
import { translateDbError } from "../utils/errors";
import { stripFormatting } from "../utils/formatters";

export type FiltroStatusCliente = "todos" | "ativos" | "inativos";
export type FiltroTipoCliente = "todos" | "PF" | "PJ";

export function useClientes() {
    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [loading, setLoading] = useState(true);
    const [busca, setBusca] = useState("");
    const [filtroStatus, setFiltroStatus] = useState<FiltroStatusCliente>("todos");
    const [filtroTipo, setFiltroTipo] = useState<FiltroTipoCliente>("todos");

    async function fetchDados() {
        setLoading(true);

        try {
            const { data, error } = await supabase.from("clientes").select("*").order("nome", { ascending: true });

            if (error) throw error;
            if (data) setClientes(data as Cliente[]);
        } catch (error) {
            console.error("Erro ao buscar clientes:", error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchDados();
    }, []);

    const clientesFiltrados = clientes.filter((c) => {
        if (filtroStatus === "ativos" && !c.ativo) return false;
        if (filtroStatus === "inativos" && c.ativo) return false;

        if (filtroTipo !== "todos" && c.tipo_pessoa !== filtroTipo) return false;

        if (busca.trim()) {
            const searchRaw = busca.toLowerCase();
            const searchStripped = stripFormatting(busca);

            const matchNome = c.nome.toLowerCase().includes(searchRaw);
            const matchEmail = c.email ? c.email.toLowerCase().includes(searchRaw) : false;
            const matchCidade = c.cidade ? c.cidade.toLowerCase().includes(searchRaw) : false;
            const matchDoc = searchStripped && c.documento ? c.documento.includes(searchStripped) : false;

            return matchNome || matchEmail || matchCidade || matchDoc;
        }

        return true;
    });

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

            await fetchDados();
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

            await fetchDados();
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
            await fetchDados();
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

            await fetchDados();
            return { success: true };
        } catch (error: any) {
            console.error("Erro ao excluir cliente:", error);
            return { success: false, error: translateDbError(error) };
        }
    }

    return {
        clientes: clientesFiltrados,
        totalClientes: clientes.length,
        loading,
        busca,
        setBusca,
        filtroStatus,
        setFiltroStatus,
        filtroTipo,
        setFiltroTipo,
        recarregar: fetchDados,
        createCliente,
        updateCliente,
        toggleStatusCliente,
        deleteCliente,
    };
}
