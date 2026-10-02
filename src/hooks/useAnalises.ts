import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
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

export interface MetricasAnaliticas {
    volumeTotal: number;
    saldoLiquido: number;
    topCategoria: string;
    totalCategoriasAtivas: number;
}

export function useAnalises() {
    const [loading, setLoading] = useState(true);
    const [fluxoMovimentacoes, setFluxoMovimentacoes] = useState<FluxoMovimentacaoItem[]>([]);
    const [temMovimentacoesNoPeriodo, setTemMovimentacoesNoPeriodo] = useState<boolean>(false);
    const [distribuicaoCategorias, setDistribuicaoCategorias] = useState<CategoriaDistribuicaoItem[]>([]);
    const [metricasAnaliticas, setMetricasAnaliticas] = useState<MetricasAnaliticas>({
        volumeTotal: 0,
        saldoLiquido: 0,
        topCategoria: "-",
        totalCategoriasAtivas: 0,
    });

    useEffect(() => {
        async function fetchAnalisesData() {
            setLoading(true);
            try {
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

                const [movsFluxoRes, produtosRes] = await Promise.all([
                    supabase
                        .from("movimentacoes")
                        .select("tipo, quantidade, criada_em")
                        .gte("criada_em", dataInicioIso),
                    supabase.from("produtos").select("quantidade, preco, categorias(nome)"),
                ]);

                const timelineMap = new Map<string, { diaMes: string; entradas: number; saidas: number }>();
                diasTimeline.forEach((dia) => {
                    timelineMap.set(dia.key, { diaMes: dia.diaMes, entradas: 0, saidas: 0 });
                });

                let totalMovsNoPeriodo = 0;
                let totalEntradas = 0;
                let totalSaidas = 0;

                (movsFluxoRes.data || []).forEach((m: any) => {
                    const chaveData = getOperationalDateKey(m.criada_em);
                    const entry = timelineMap.get(chaveData);
                    if (entry) {
                        totalMovsNoPeriodo++;
                        const qtd = Number(m.quantidade || 0);
                        if (m.tipo === "entrada") {
                            entry.entradas += qtd;
                            totalEntradas += qtd;
                        }
                        if (m.tipo === "saida") {
                            entry.saidas += qtd;
                            totalSaidas += qtd;
                        }
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

                let valorTotalGeral = 0;
                const categoriasMap = new Map<string, { valorTotal: number; quantidadeItens: number }>();

                (produtosRes.data || []).forEach((p: any) => {
                    const qtd = Number(p.quantidade || 0);
                    const preco = Number(p.preco || 0);
                    const subtotal = qtd * preco;
                    valorTotalGeral += subtotal;

                    const catNome =
                        (Array.isArray(p.categorias) ? p.categorias[0]?.nome : p.categorias?.nome) || "Sem categoria";

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
                        percentual:
                            valorTotalGeral > 0 ? Number(((dados.valorTotal / valorTotalGeral) * 100).toFixed(1)) : 0,
                    }))
                    .sort((a, b) => b.valorTotal - a.valorTotal);

                setDistribuicaoCategorias(categoriasAgrupadas);

                const topCat = categoriasAgrupadas.find((c) => c.valorTotal > 0)?.categoria || "-";
                const totalCategoriasAtivas = categoriasAgrupadas.filter((c) => c.valorTotal > 0).length;

                setMetricasAnaliticas({
                    volumeTotal: totalEntradas + totalSaidas,
                    saldoLiquido: totalEntradas - totalSaidas,
                    topCategoria: topCat,
                    totalCategoriasAtivas,
                });
            } catch (error) {
                console.error("Erro ao buscar dados de análises:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchAnalisesData();
    }, []);

    return {
        loading,
        fluxoMovimentacoes,
        temMovimentacoesNoPeriodo,
        distribuicaoCategorias,
        metricasAnaliticas,
    };
}
