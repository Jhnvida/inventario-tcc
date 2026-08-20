import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { ItemPedido, Pedido } from "../types";

export type PedidoCompleto = Pedido & {
    fornecedores: { razao_social: string; nome_fantasia: string } | null;
    itens_pedido?: (ItemPedido & { produtos: { nome: string; sku: string } | null })[];
};

export function usePedidos() {
    const [pedidos, setPedidos] = useState<PedidoCompleto[]>([]);
    const [loading, setLoading] = useState(true);
    const [busca, setBusca] = useState("");
    const [statusFiltro, setStatusFiltro] = useState("");

    async function fetchDados() {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from("pedidos")
                .select(
                    `
                    *,
                    fornecedores(razao_social, nome_fantasia),
                    itens_pedido(*, produtos(nome, sku))
                `,
                )
                .order("criado_em", { ascending: false });

            if (error) throw error;
            if (data) setPedidos(data as unknown as PedidoCompleto[]);
        } catch (error) {
            console.error("Erro ao buscar pedidos:", error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchDados();
    }, []);

    const pedidosFiltrados = pedidos.filter((p) => {
        const fornecedor = p.fornecedores?.razao_social || "";
        const matchBusca = fornecedor.toLowerCase().includes(busca.toLowerCase());
        const matchStatus = statusFiltro ? p.status === statusFiltro : true;

        return matchBusca && matchStatus;
    });

    const receberPedido = async (pedidoId: string) => {
        try {
            const { error } = await supabase.rpc("receber_pedido", { p_pedido_id: pedidoId });
            if (error) throw error;
            await fetchDados();
            return { success: true };
        } catch (error: any) {
            console.error("Erro ao receber pedido:", error);
            return { success: false, error: error.message };
        }
    };

    const salvarPedido = async (
        pedidoData: {
            fornecedor_id: string;
            status: "rascunho" | "enviado" | "concluido" | "cancelado";
            valor_total: number;
        },
        itens: { produto_id: string; quantidade: number; preco_unitario: number }[],
        pedidoId?: string,
    ) => {
        try {
            let pid = pedidoId;

            // 1. Inserir ou atualizar pedido
            if (pid) {
                const { error: errorPedido } = await supabase
                    .from("pedidos")
                    .update({ ...pedidoData, atualizado_em: new Date().toISOString() })
                    .eq("id", pid);
                if (errorPedido) throw errorPedido;

                // Apagar itens antigos
                const { error: errorDelete } = await supabase.from("itens_pedido").delete().eq("pedido_id", pid);
                if (errorDelete) throw errorDelete;
            } else {
                const { data: newPedido, error: errorPedido } = await supabase
                    .from("pedidos")
                    .insert([pedidoData])
                    .select()
                    .single();
                if (errorPedido) throw errorPedido;
                pid = newPedido.id;
            }

            // 2. Inserir itens
            if (itens.length > 0) {
                const itensParaInserir = itens.map((item) => ({
                    ...item,
                    pedido_id: pid,
                }));
                const { error: errorItens } = await supabase.from("itens_pedido").insert(itensParaInserir);
                if (errorItens) throw errorItens;
            }

            await fetchDados();
            return { success: true };
        } catch (error: any) {
            console.error("Erro ao salvar pedido:", error);
            return { success: false, error: error.message };
        }
    };

    return {
        pedidos: pedidosFiltrados,
        loading,
        busca,
        setBusca,
        statusFiltro,
        setStatusFiltro,
        recarregar: fetchDados,
        receberPedido,
        salvarPedido,
    };
}
