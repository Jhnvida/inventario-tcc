import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { ItemPedidoVenda, PedidoVenda } from "../types";
import { translateDbError } from "../utils/errors";

export type PedidoVendaCompleto = PedidoVenda & {
    clientes: { nome: string; documento: string | null; tipo_pessoa: string } | null;
    itens_pedido_venda?: (ItemPedidoVenda & {
        produtos: { nome: string; sku: string; quantidade: number; preco: number } | null;
    })[];
    usuarios?: { nome: string } | null;
};

const ITENS_POR_PAGINA = 10;

export function usePedidosVenda() {
    const [pedidos, setPedidos] = useState<PedidoVendaCompleto[]>([]);
    const [totalPedidos, setTotalPedidos] = useState(0);
    const [pagina, setPagina] = useState(1);
    const [loading, setLoading] = useState(true);

    const [busca, setBusca] = useState("");
    const [statusFiltro, setStatusFiltro] = useState("");

    const fetchDados = useCallback(
        async (paginaAlvo = pagina) => {
            setLoading(true);
            try {
                const from = (paginaAlvo - 1) * ITENS_POR_PAGINA;
                const to = from + ITENS_POR_PAGINA - 1;

                const selectQuery = busca.trim()
                    ? `
                    *,
                    clientes!inner(nome, documento, tipo_pessoa),
                    usuarios(nome),
                    itens_pedido_venda(*, produtos(nome, sku, quantidade, preco))
                `
                    : `
                    *,
                    clientes(nome, documento, tipo_pessoa),
                    usuarios(nome),
                    itens_pedido_venda(*, produtos(nome, sku, quantidade, preco))
                `;

                let query = supabase.from("pedidos_venda").select(selectQuery, { count: "exact" });

                if (statusFiltro) {
                    query = query.eq("status", statusFiltro);
                }

                if (busca.trim()) {
                    const b = busca.trim();
                    query = query.or(`nome.ilike.%${b}%`, { foreignTable: "clientes" });
                }

                query = query.order("criado_em", { ascending: false }).range(from, to);

                const { data, count, error } = await query;
                if (error) throw error;

                const total = count ?? 0;
                setTotalPedidos(total);

                const maxPaginas = Math.max(1, Math.ceil(total / ITENS_POR_PAGINA));
                if (paginaAlvo > maxPaginas && total > 0) {
                    setPagina(maxPaginas);
                    return;
                }

                setPedidos((data as unknown as PedidoVendaCompleto[]) || []);
            } catch (error) {
                console.error("Erro ao buscar pedidos de venda:", error);
            } finally {
                setLoading(false);
            }
        },
        [pagina, busca, statusFiltro],
    );

    useEffect(() => {
        fetchDados(pagina);
    }, [fetchDados, pagina]);

    const handleSetBusca = (novaBusca: string) => {
        setBusca(novaBusca);
        setPagina(1);
    };

    const handleSetStatusFiltro = (novoStatus: string) => {
        setStatusFiltro(novoStatus);
        setPagina(1);
    };

    async function finalizarVenda(pedidoId: string) {
        try {
            const {
                data: { user: currentUser },
            } = await supabase.auth.getUser();

            const { error } = await supabase.rpc("finalizar_pedido_venda", {
                p_pedido_id: pedidoId,
                p_usuario_id: currentUser?.id || null,
            });

            if (error) throw error;
            await fetchDados(pagina);
            return { success: true };
        } catch (error: any) {
            console.error("Erro ao finalizar pedido de venda:", error);
            return { success: false, error: translateDbError(error) };
        }
    }

    async function cancelarVenda(pedidoId: string) {
        try {
            const { error } = await supabase.rpc("cancelar_pedido_venda", {
                p_pedido_id: pedidoId,
            });

            if (error) throw error;
            await fetchDados(pagina);
            return { success: true };
        } catch (error: any) {
            console.error("Erro ao cancelar pedido de venda:", error);
            return { success: false, error: translateDbError(error) };
        }
    }

    async function salvarPedidoVenda(
        pedidoData: {
            cliente_id: string;
            observacoes?: string | null;
            valor_total: number;
        },
        itens: { produto_id: string; quantidade: number; preco_unitario: number }[],
        pedidoId?: string,
    ) {
        try {
            let pid = pedidoId;

            if (pid) {
                const { error: errorPedido } = await supabase
                    .from("pedidos_venda")
                    .update({ ...pedidoData, atualizado_em: new Date().toISOString() })
                    .eq("id", pid);
                if (errorPedido) throw errorPedido;

                const { error: errorDelete } = await supabase
                    .from("itens_pedido_venda")
                    .delete()
                    .eq("pedido_venda_id", pid);
                if (errorDelete) throw errorDelete;
            } else {
                const {
                    data: { user: currentUser },
                } = await supabase.auth.getUser();

                const { data: newPedido, error: errorPedido } = await supabase
                    .from("pedidos_venda")
                    .insert([{ ...pedidoData, status: "rascunho", usuario_id: currentUser?.id || null }])
                    .select()
                    .single();
                if (errorPedido) throw errorPedido;
                pid = newPedido.id;
            }

            if (itens.length > 0) {
                const itensParaInserir = itens.map((item) => ({
                    ...item,
                    pedido_venda_id: pid,
                }));
                const { error: errorItens } = await supabase.from("itens_pedido_venda").insert(itensParaInserir);
                if (errorItens) throw errorItens;
            }

            await fetchDados(pagina);
            return { success: true };
        } catch (error: any) {
            console.error("Erro ao salvar pedido de venda:", error);
            return { success: false, error: translateDbError(error) };
        }
    }

    async function deletePedidoVenda(id: string) {
        try {
            const { error } = await supabase.from("pedidos_venda").delete().eq("id", id);
            if (error) throw error;
            await fetchDados(pagina);
            return { success: true };
        } catch (error: any) {
            console.error("Erro ao excluir pedido de venda:", error);
            return { success: false, error: translateDbError(error) };
        }
    }

    return {
        pedidos,
        totalPedidos,
        pagina,
        setPagina,
        totalPaginas: Math.ceil(totalPedidos / ITENS_POR_PAGINA),
        itensPorPagina: ITENS_POR_PAGINA,
        loading,
        busca,
        setBusca: handleSetBusca,
        statusFiltro,
        setStatusFiltro: handleSetStatusFiltro,
        recarregar: () => fetchDados(pagina),
        finalizarVenda,
        cancelarVenda,
        salvarPedidoVenda,
        deletePedidoVenda,
    };
}
