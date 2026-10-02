import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { ItemPedido, Pedido } from "../types";
import { translateDbError } from "../utils/errors";

export type PedidoCompleto = Pedido & {
    fornecedores: { razao_social: string; nome_fantasia: string } | null;
    itens_pedido?: (ItemPedido & { produtos: { nome: string; sku: string } | null })[];
};

const ITENS_POR_PAGINA = 10;

export function usePedidos() {
    const [pedidos, setPedidos] = useState<PedidoCompleto[]>([]);
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
                    fornecedores!inner(razao_social, nome_fantasia),
                    itens_pedido(*, produtos(nome, sku))
                `
                    : `
                    *,
                    fornecedores(razao_social, nome_fantasia),
                    itens_pedido(*, produtos(nome, sku))
                `;

                let query = supabase.from("pedidos").select(selectQuery, { count: "exact" });

                if (statusFiltro) {
                    query = query.eq("status", statusFiltro);
                }

                if (busca.trim()) {
                    const b = busca.trim();
                    query = query.or(`razao_social.ilike.%${b}%,nome_fantasia.ilike.%${b}%`, {
                        foreignTable: "fornecedores",
                    });
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

                setPedidos((data as unknown as PedidoCompleto[]) || []);
            } catch (error) {
                console.error("Erro ao buscar pedidos:", error);
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

    async function receberPedido(pedidoId: string) {
        try {
            const {
                data: { user: currentUser },
            } = await supabase.auth.getUser();

            const { error } = await supabase.rpc("receber_pedido", {
                p_pedido_id: pedidoId,
                p_usuario_id: currentUser?.id || null,
            });

            if (error) throw error;
            await fetchDados(pagina);
            return { success: true };
        } catch (error: any) {
            console.error("Erro ao receber pedido:", error);
            return { success: false, error: translateDbError(error) };
        }
    }

    async function salvarPedido(
        pedidoData: {
            fornecedor_id: string;
            status: "rascunho" | "enviado" | "concluido" | "cancelado";
            valor_total: number;
        },
        itens: { produto_id: string; quantidade: number; preco_unitario: number }[],
        pedidoId?: string,
    ) {
        try {
            let pid = pedidoId;

            if (pid) {
                const { error: errorPedido } = await supabase
                    .from("pedidos")
                    .update({ ...pedidoData, atualizado_em: new Date().toISOString() })
                    .eq("id", pid);
                if (errorPedido) throw errorPedido;

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

            if (itens.length > 0) {
                const itensParaInserir = itens.map((item) => ({
                    ...item,
                    pedido_id: pid,
                }));
                const { error: errorItens } = await supabase.from("itens_pedido").insert(itensParaInserir);
                if (errorItens) throw errorItens;
            }

            await fetchDados(pagina);
            return { success: true };
        } catch (error: any) {
            console.error("Erro ao salvar pedido:", error);
            return { success: false, error: translateDbError(error) };
        }
    }

    async function deletePedido(id: string) {
        try {
            const { error } = await supabase.from("pedidos").delete().eq("id", id);
            if (error) throw error;
            await fetchDados(pagina);
            return { success: true };
        } catch (error: any) {
            console.error("Erro ao excluir pedido:", error);
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
        receberPedido,
        salvarPedido,
        deletePedido,
    };
}
