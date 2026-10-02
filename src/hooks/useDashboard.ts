import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { DashboardMetricas, Movimentacao, Produto } from "../types";
import { getOperationalDateKey } from "../utils/formatters";

export interface ResumoFluxo14d {
    totalEntradas: number;
    totalSaidas: number;
    saldoLiquido: number;
    totalMovimentacoes: number;
}

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
    const [resumoFluxo, setResumoFluxo] = useState<ResumoFluxo14d>({
        totalEntradas: 0,
        totalSaidas: 0,
        saldoLiquido: 0,
        totalMovimentacoes: 0,
    });
    const [userName, setUserName] = useState<string>("");

    useEffect(() => {
        async function fetchDashboardData() {
            setLoading(true);
            try {
                const {
                    data: { user },
                } = await supabase.auth.getUser();
                if (user) {
                    const { data: userData } = await supabase
                        .from("usuarios")
                        .select("nome")
                        .eq("id", user.id)
                        .single();
                    setUserName(userData?.nome || user.user_metadata?.nome || "Usuário");
                } else {
                    setUserName("Usuário");
                }

                const now = new Date();
                const dInicio = new Date(now.getTime() - 13 * 24 * 60 * 60 * 1000);
                const dataInicioKey = getOperationalDateKey(dInicio);
                const dataInicioIso = new Date(`${dataInicioKey}T00:00:00-03:00`).toISOString();

                const [prodRes, pedidosRes, movsRes, fluxoRes] = await Promise.all([
                    supabase.from("produtos").select("id, nome, sku, quantidade, estoque_minimo, preco"),
                    supabase
                        .from("pedidos")
                        .select("*", { count: "exact", head: true })
                        .in("status", ["rascunho", "enviado"]),
                    supabase
                        .from("movimentacoes")
                        .select(`*, produtos (nome, sku), usuarios (nome)`)
                        .order("criada_em", { ascending: false })
                        .limit(5),
                    supabase
                        .from("movimentacoes")
                        .select("tipo, quantidade, criada_em")
                        .gte("criada_em", dataInicioIso),
                ]);

                const produtos = prodRes.data || [];
                let valorTotal = 0;
                const criticos: Produto[] = [];

                produtos.forEach((p: any) => {
                    const qtd = Number(p.quantidade || 0);
                    const preco = Number(p.preco || 0);
                    valorTotal += qtd * preco;

                    if (qtd <= Number(p.estoque_minimo || 0)) {
                        criticos.push(p);
                    }
                });

                criticos.sort((a, b) => {
                    const defA = Math.max((a.estoque_minimo || 0) - (a.quantidade || 0), 0);
                    const defB = Math.max((b.estoque_minimo || 0) - (b.quantidade || 0), 0);
                    return defB - defA;
                });

                setMetricas({
                    valorTotal,
                    totalProdutos: produtos.length,
                    estoqueCritico: criticos.length,
                    pedidosAbertos: pedidosRes.count || 0,
                });

                setItensCriticos(criticos);

                if (movsRes.data) {
                    setMovimentacoesRecentes(movsRes.data as unknown as Movimentacao[]);
                }

                let totalEntradas = 0;
                let totalSaidas = 0;
                let totalMovimentacoes = 0;

                (fluxoRes.data || []).forEach((m: any) => {
                    totalMovimentacoes++;
                    const qtd = Number(m.quantidade || 0);
                    if (m.tipo === "entrada") totalEntradas += qtd;
                    if (m.tipo === "saida") totalSaidas += qtd;
                });

                setResumoFluxo({
                    totalEntradas,
                    totalSaidas,
                    saldoLiquido: totalEntradas - totalSaidas,
                    totalMovimentacoes,
                });
            } catch (error) {
                console.error("Erro ao buscar dados do dashboard:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchDashboardData();
    }, []);

    return {
        loading,
        metricas,
        itensCriticos,
        movimentacoesRecentes,
        resumoFluxo,
        userName,
    };
}
