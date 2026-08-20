import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { DashboardMetricas, Movimentacao, Produto } from "../types";

export function useDashboard() {
    const [loading, setLoading] = useState(true);
    const [metricas, setMetricas] = useState<DashboardMetricas>({
        valorTotal: 0,
        totalProdutos: 0,
        estoqueCritico: 0,
        pedidosAbertos: 0,
    });
    const [itensCriticos, setItensCriticos] = useState<Produto[]>([]);
    const [movimentacoesRecentes, setMovimentacoesRecentes] = useState<Movimentacao[]>([]);

    useEffect(() => {
        async function fetchDashboardData() {
            try {
                // 1. Busca produtos
                const { data: produtos } = await supabase
                    .from("produtos")
                    .select("id, nome, sku, quantidade, estoque_minimo, preco");

                // 2. Busca pedidos em aberto
                const { count: pedidosCount } = await supabase
                    .from("pedidos")
                    .select("*", { count: "exact", head: true })
                    .in("status", ["rascunho", "enviado"]);

                // 3. Busca movimentações recentes
                const { data: movs } = await supabase
                    .from("movimentacoes")
                    .select(`*, produtos (nome, sku)`)
                    .order("criada_em", { ascending: false })
                    .limit(5);

                if (produtos) {
                    let valorTotal = 0;
                    let estoqueCriticoCount = 0;
                    const criticos: Produto[] = [];

                    produtos.forEach((p) => {
                        valorTotal += p.quantidade * p.preco;
                        if (p.quantidade <= p.estoque_minimo) {
                            estoqueCriticoCount++;
                            criticos.push(p);
                        }
                    });

                    setMetricas({
                        valorTotal,
                        totalProdutos: produtos.length,
                        estoqueCritico: estoqueCriticoCount,
                        pedidosAbertos: pedidosCount || 0,
                    });

                    setItensCriticos(criticos);
                }

                if (movs) {
                    setMovimentacoesRecentes(movs as unknown as Movimentacao[]);
                }
            } catch (error) {
                console.error("Erro ao buscar dados do dashboard:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchDashboardData();
    }, []);

    return { loading, metricas, itensCriticos, movimentacoesRecentes };
}
