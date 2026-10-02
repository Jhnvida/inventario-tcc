import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { DashboardMetricas, Movimentacao, Produto } from "../types";
import { getOperationalDateKey, getOperationalDayMonth } from "../utils/formatters";

export interface FluxoMovimentacaoItem {
    data: string;
    diaMes: string;
    entradas: number;
    saidas: number;
}

export interface CategoriaDistribuicaoItem {
    categoria: string;
    valorTotal: number;
    quantidadeItens: number;
    percentual: number;
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
    const [fluxoMovimentacoes, setFluxoMovimentacoes] = useState<FluxoMovimentacaoItem[]>([]);
    const [temMovimentacoesNoPeriodo, setTemMovimentacoesNoPeriodo] = useState<boolean>(false);
    const [distribuicaoCategorias, setDistribuicaoCategorias] = useState<CategoriaDistribuicaoItem[]>([]);
    const [userName, setUserName] = useState<string>("");

    useEffect(() => {
        async function fetchDashboardData() {
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

                const { data: produtos } = await supabase
                    .from("produtos")
                    .select("id, nome, sku, quantidade, estoque_minimo, preco, categorias(nome)");

                const { count: pedidosCount } = await supabase
                    .from("pedidos")
                    .select("*", { count: "exact", head: true })
                    .in("status", ["rascunho", "enviado"]);

                const { data: movs } = await supabase
                    .from("movimentacoes")
                    .select(`*, produtos (nome, sku), usuarios (nome)`)
                    .order("criada_em", { ascending: false })
                    .limit(5);

                const now = new Date();
                const diasTimeline: { key: string; diaMes: string }[] = [];
                for (let i = 13; i >= 0; i--) {
                    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
                    diasTimeline.push({
                        key: getOperationalDateKey(d),
                        diaMes: getOperationalDayMonth(d),
                    });
                }

                const dataInicioKey = diasTimeline[0].key;
                const dataInicioIso = new Date(`${dataInicioKey}T00:00:00-03:00`).toISOString();

                const { data: movsFluxo } = await supabase
                    .from("movimentacoes")
                    .select("tipo, quantidade, criada_em")
                    .gte("criada_em", dataInicioIso);

                if (produtos) {
                    let valorTotal = 0;
                    const criticos: Produto[] = [];
                    const categoriasMap = new Map<string, { valorTotal: number; quantidadeItens: number }>();

                    produtos.forEach((p: any) => {
                        const qtd = Number(p.quantidade || 0);
                        const preco = Number(p.preco || 0);
                        const subtotal = qtd * preco;
                        valorTotal += subtotal;

                        if (qtd <= Number(p.estoque_minimo || 0)) {
                            criticos.push(p);
                        }

                        const catNome =
                            (Array.isArray(p.categorias) ? p.categorias[0]?.nome : p.categorias?.nome) ||
                            "Sem categoria";
                        const atual = categoriasMap.get(catNome) || { valorTotal: 0, quantidadeItens: 0 };
                        categoriasMap.set(catNome, {
                            valorTotal: atual.valorTotal + subtotal,
                            quantidadeItens: atual.quantidadeItens + qtd,
                        });
                    });

                    const categoriasAgrupadas: CategoriaDistribuicaoItem[] = Array.from(categoriasMap.entries())
                        .map(([categoria, dados]) => ({
                            categoria,
                            valorTotal: dados.valorTotal,
                            quantidadeItens: dados.quantidadeItens,
                            percentual: valorTotal > 0 ? Number(((dados.valorTotal / valorTotal) * 100).toFixed(1)) : 0,
                        }))
                        .sort((a, b) => b.valorTotal - a.valorTotal);

                    setMetricas({
                        valorTotal,
                        totalProdutos: produtos.length,
                        estoqueCritico: criticos.length,
                        pedidosAbertos: pedidosCount || 0,
                    });

                    setItensCriticos(criticos);
                    setDistribuicaoCategorias(categoriasAgrupadas);
                }

                const timelineMap = new Map<string, { diaMes: string; entradas: number; saidas: number }>();
                diasTimeline.forEach((dia) => {
                    timelineMap.set(dia.key, { diaMes: dia.diaMes, entradas: 0, saidas: 0 });
                });

                let totalMovsNoPeriodo = 0;
                (movsFluxo || []).forEach((m: any) => {
                    const chaveData = getOperationalDateKey(m.criada_em);
                    const entry = timelineMap.get(chaveData);
                    if (entry) {
                        totalMovsNoPeriodo++;
                        if (m.tipo === "entrada") entry.entradas += Number(m.quantidade || 0);
                        if (m.tipo === "saida") entry.saidas += Number(m.quantidade || 0);
                    }
                });

                setTemMovimentacoesNoPeriodo(totalMovsNoPeriodo > 0);

                const fluxoFormatado: FluxoMovimentacaoItem[] = Array.from(timelineMap.entries()).map(([data, v]) => ({
                    data,
                    diaMes: v.diaMes,
                    entradas: v.entradas,
                    saidas: v.saidas,
                }));

                setFluxoMovimentacoes(fluxoFormatado);

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

    return {
        loading,
        metricas,
        itensCriticos,
        movimentacoesRecentes,
        userName,
        fluxoMovimentacoes,
        temMovimentacoesNoPeriodo,
        distribuicaoCategorias,
    };
}
