import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { DashboardMetricas, Movimentacao, Produto } from "../types";

export interface ProdutoCurvaABC extends Produto {
    valorTotal: number;
    percentualTotal: number;
    percentualAcumulado: number;
    classe: "A" | "B" | "C";
}

export interface CurvaABCCategoria {
    classe: "A" | "B" | "C";
    titulo: string;
    qtdProdutos: number;
    percentualProdutos: number;
    valorTotal: number;
    percentualValor: number;
}

export interface CurvaABCResumo {
    classes: {
        A: CurvaABCCategoria;
        B: CurvaABCCategoria;
        C: CurvaABCCategoria;
    };
    produtosClassificados: ProdutoCurvaABC[];
    topItensClasseA: ProdutoCurvaABC[];
}

export function useDashboard() {
    const [loading, setLoading] = useState(true);
    const [metricas, setMetricas] = useState<DashboardMetricas>({
        valorTotal: 0,
        totalProdutos: 0,
        estoqueCritico: 0,
        pedidosAbertos: 0,
    });
    const [itensCriticos, setItensCriticos] = useState<(Produto & { classeABC?: "A" | "B" | "C" })[]>([]);
    const [movimentacoesRecentes, setMovimentacoesRecentes] = useState<Movimentacao[]>([]);
    const [userName, setUserName] = useState<string>("");
    const [curvaABC, setCurvaABC] = useState<CurvaABCResumo>({
        classes: {
            A: {
                classe: "A",
                titulo: "Classe A",
                qtdProdutos: 0,
                percentualProdutos: 0,
                valorTotal: 0,
                percentualValor: 0,
            },
            B: {
                classe: "B",
                titulo: "Classe B",
                qtdProdutos: 0,
                percentualProdutos: 0,
                valorTotal: 0,
                percentualValor: 0,
            },
            C: {
                classe: "C",
                titulo: "Classe C",
                qtdProdutos: 0,
                percentualProdutos: 0,
                valorTotal: 0,
                percentualValor: 0,
            },
        },
        produtosClassificados: [],
        topItensClasseA: [],
    });

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
                    .select("id, nome, sku, quantidade, estoque_minimo, preco");

                const { count: pedidosCount } = await supabase
                    .from("pedidos")
                    .select("*", { count: "exact", head: true })
                    .in("status", ["rascunho", "enviado"]);

                const { data: movs } = await supabase
                    .from("movimentacoes")
                    .select(`*, produtos (nome, sku)`)
                    .order("criada_em", { ascending: false })
                    .limit(5);

                if (produtos) {
                    let valorTotal = 0;
                    const criticos: Produto[] = [];

                    produtos.forEach((p) => {
                        valorTotal += p.quantidade * p.preco;
                        if (p.quantidade <= p.estoque_minimo) {
                            criticos.push(p);
                        }
                    });

                    const produtosComValor: ProdutoCurvaABC[] = produtos
                        .map((p) => ({
                            ...p,
                            valorTotal: p.quantidade * p.preco,
                            percentualTotal: 0,
                            percentualAcumulado: 0,
                            classe: "C" as "A" | "B" | "C",
                        }))
                        .sort((a, b) => b.valorTotal - a.valorTotal);

                    const totalValorEstoque = produtosComValor.reduce((acc, p) => acc + p.valorTotal, 0);

                    let acumuladoPerc = 0;
                    const contagem = { A: 0, B: 0, C: 0 };
                    const valorPorClasse = { A: 0, B: 0, C: 0 };

                    produtosComValor.forEach((p) => {
                        const perc = totalValorEstoque > 0 ? (p.valorTotal / totalValorEstoque) * 100 : 0;
                        const acumuladoAnterior = acumuladoPerc;
                        acumuladoPerc += perc;
                        p.percentualTotal = Number(perc.toFixed(1));
                        p.percentualAcumulado = Number(acumuladoPerc.toFixed(1));

                        if (acumuladoAnterior < 70 || contagem.A === 0) {
                            p.classe = "A";
                            contagem.A += 1;
                            valorPorClasse.A += p.valorTotal;
                        } else if (acumuladoAnterior < 90) {
                            p.classe = "B";
                            contagem.B += 1;
                            valorPorClasse.B += p.valorTotal;
                        } else {
                            p.classe = "C";
                            contagem.C += 1;
                            valorPorClasse.C += p.valorTotal;
                        }
                    });

                    const totalProds = produtosComValor.length;

                    setCurvaABC({
                        classes: {
                            A: {
                                classe: "A",
                                titulo: "Classe A",
                                qtdProdutos: contagem.A,
                                percentualProdutos:
                                    totalProds > 0 ? Number(((contagem.A / totalProds) * 100).toFixed(1)) : 0,
                                valorTotal: valorPorClasse.A,
                                percentualValor:
                                    totalValorEstoque > 0
                                        ? Number(((valorPorClasse.A / totalValorEstoque) * 100).toFixed(1))
                                        : 0,
                            },
                            B: {
                                classe: "B",
                                titulo: "Classe B",
                                qtdProdutos: contagem.B,
                                percentualProdutos:
                                    totalProds > 0 ? Number(((contagem.B / totalProds) * 100).toFixed(1)) : 0,
                                valorTotal: valorPorClasse.B,
                                percentualValor:
                                    totalValorEstoque > 0
                                        ? Number(((valorPorClasse.B / totalValorEstoque) * 100).toFixed(1))
                                        : 0,
                            },
                            C: {
                                classe: "C",
                                titulo: "Classe C",
                                qtdProdutos: contagem.C,
                                percentualProdutos:
                                    totalProds > 0 ? Number(((contagem.C / totalProds) * 100).toFixed(1)) : 0,
                                valorTotal: valorPorClasse.C,
                                percentualValor:
                                    totalValorEstoque > 0
                                        ? Number(((valorPorClasse.C / totalValorEstoque) * 100).toFixed(1))
                                        : 0,
                            },
                        },
                        produtosClassificados: produtosComValor,
                        topItensClasseA: produtosComValor.filter((p) => p.classe === "A").slice(0, 5),
                    });

                    const criticosComABC = criticos.map((c) => {
                        const classificado = produtosComValor.find((p) => p.id === c.id);
                        return {
                            ...c,
                            classeABC: classificado?.classe || "C",
                        };
                    });

                    setMetricas({
                        valorTotal,
                        totalProdutos: produtos.length,
                        estoqueCritico: criticos.length,
                        pedidosAbertos: pedidosCount || 0,
                    });

                    setItensCriticos(criticosComABC);
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

    return { loading, metricas, itensCriticos, movimentacoesRecentes, userName, curvaABC };
}
