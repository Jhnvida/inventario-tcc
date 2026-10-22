import { supabase } from "../../lib/supabase";
import { tracer } from "./tracer";

const handlers: Record<string, (args: any, parentNodeId?: string) => Promise<any>> = {
    consultar_produtos: async function (args, parentNodeId) {
        let query = supabase
            .from("produtos")
            .select("nome, sku, preco, quantidade, estoque_minimo, localizacao, categorias(nome)");

        if (args.ordenacao === "quantidade_desc") {
            query = query.order("quantidade", { ascending: false });
        } else if (args.ordenacao === "quantidade_asc") {
            query = query.order("quantidade", { ascending: true });
        } else {
            query = query.order("nome", { ascending: true });
        }

        if (args.limite) {
            query = query.limit(args.limite);
        }

        if (args.termo_busca) {
            query = query.or(`nome.ilike.%${args.termo_busca}%,sku.ilike.%${args.termo_busca}%`);
        }

        const { data, error } = await query;

        if (error) {
            console.error("Erro na consulta de produtos:", error);
            return { erro: "Falha ao consultar produtos no banco de dados." };
        }

        if (parentNodeId) {
            tracer.updateStep({
                id: `db-produtos-${Date.now()}`,
                parentId: parentNodeId,
                stepType: "db_query",
                label: "PostgreSQL: produtos",
                sublabel: `${data?.length || 0} produto(s) encontrado(s)`,
                status: "success",
                iconType: "database",
                metadata: { tabela: "produtos", filtro: args, total_registros: data?.length },
            });
        }

        if (args.filtro_estoque === "baixo") {
            return data?.filter((p: any) => p.quantidade > 0 && p.quantidade <= p.estoque_minimo);
        }

        if (args.filtro_estoque === "zerado") {
            return data?.filter((p: any) => p.quantidade === 0);
        }

        return data;
    },

    consultar_resumo_estoque: async function (_args?: any, parentNodeId?: string) {
        const { data, error } = await supabase.from("produtos").select("quantidade, estoque_minimo, preco");

        if (error) {
            console.error("Erro na consulta de resumo:", error);
            return { erro: "Falha ao calcular o resumo do estoque." };
        }

        const totalUnicos = data?.length || 0;
        const totalItens = data?.reduce((acc, curr) => acc + curr.quantidade, 0) || 0;
        const valorTotal = data?.reduce((acc, curr) => acc + curr.quantidade * curr.preco, 0) || 0;
        const estoqueBaixo = data?.filter((p) => p.quantidade <= p.estoque_minimo && p.quantidade > 0).length || 0;
        const estoqueZerado = data?.filter((p) => p.quantidade === 0).length || 0;

        if (parentNodeId) {
            tracer.updateStep({
                id: `db-resumo-${Date.now()}`,
                parentId: parentNodeId,
                stepType: "db_query",
                label: "PostgreSQL: produtos (agregação)",
                sublabel: `${totalUnicos} SKUs únicos | ${totalItens} itens totais`,
                status: "success",
                iconType: "database",
                metadata: { totalUnicos, totalItens, valorTotal, estoqueBaixo, estoqueZerado },
            });
        }

        return { totalUnicos, totalItens, valorTotal, estoqueBaixo, estoqueZerado };
    },

    consultar_categorias: async function () {
        const { data, error } = await supabase.from("categorias").select("nome");
        if (error) return { erro: "Falha ao consultar categorias." };
        return data;
    },

    consultar_fornecedores: async function () {
        const { data, error } = await supabase.from("fornecedores").select("razao_social, nome_fantasia");
        if (error) return { erro: "Falha ao consultar fornecedores." };
        return data;
    },

    consultar_movimentacoes: async function (args) {
        let query = supabase
            .from("movimentacoes")
            .select("tipo, quantidade, motivo, criada_em, produtos(nome)")
            .order("criada_em", { ascending: false })
            .limit(args.limite || 5);

        if (args.tipo) {
            const t = args.tipo
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "");
            const tipoReal = t.includes("said") ? "saida" : t.includes("entrad") ? "entrada" : t;
            query = query.ilike("tipo", `%${tipoReal}%`);
        }

        if (args.data_inicio) {
            query = query.gte("criada_em", `${args.data_inicio}T00:00:00Z`);
        }

        if (args.data_fim) {
            query = query.lte("criada_em", `${args.data_fim}T23:59:59Z`);
        }

        const { data, error } = await query;
        if (error) {
            console.error("Erro na consulta de movimentacoes:", error);
            return { erro: "Falha ao consultar movimentações." };
        }

        return data;
    },

    consultar_ranking_movimentacoes: async function (args) {
        let query = supabase.from("movimentacoes").select("produto_id, quantidade, produtos(nome)");

        if (args.tipo) {
            const t = args.tipo
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "");
            const tipoReal = t.includes("said") ? "saida" : t.includes("entrad") ? "entrada" : t;
            query = query.ilike("tipo", `%${tipoReal}%`);
        }

        if (args.data_inicio) {
            query = query.gte("criada_em", `${args.data_inicio}T00:00:00Z`);
        }

        if (args.data_fim) {
            query = query.lte("criada_em", `${args.data_fim}T23:59:59Z`);
        }

        const { data, error } = await query;
        if (error) {
            console.error("Erro na consulta de ranking:", error);
            return { erro: "Falha ao calcular ranking de movimentações." };
        }

        const agrupado: Record<string, { nome: string; quantidade: number }> = {};
        for (const m of data || []) {
            const prod: any = m.produtos;
            const nome = (Array.isArray(prod) ? prod[0]?.nome : prod?.nome) || "Desconhecido";

            if (!agrupado[m.produto_id]) {
                agrupado[m.produto_id] = { nome, quantidade: 0 };
            }

            agrupado[m.produto_id].quantidade += m.quantidade;
        }

        const ranking = Object.values(agrupado)
            .sort((a, b) => b.quantidade - a.quantidade)
            .slice(0, args.limite || 5);

        return ranking;
    },

    analisar_previsao_ruptura: async function (args: any, parentNodeId?: string) {
        const diasHistorico = args.dias_historico && args.dias_historico > 0 ? Number(args.dias_historico) : 30;
        const limite = args.limite && args.limite > 0 ? Number(args.limite) : 5;

        let prodQuery = supabase
            .from("produtos")
            .select("id, nome, sku, quantidade, estoque_minimo, preco, criado_em, localizacao");

        if (args.termo_busca) {
            prodQuery = prodQuery.or(`nome.ilike.%${args.termo_busca}%,sku.ilike.%${args.termo_busca}%`).limit(limite);
        } else {
            prodQuery = prodQuery.order("quantidade", { ascending: true }).limit(limite);
        }

        const { data: produtos, error: prodError } = await prodQuery;

        if (prodError || !produtos || produtos.length === 0) {
            return {
                mensagem: "Nenhum produto encontrado para análise com os critérios informados.",
                resultados: [],
            };
        }

        const dataLimite = new Date();
        dataLimite.setDate(dataLimite.getDate() - diasHistorico);
        const dataLimiteIso = dataLimite.toISOString();

        const resultados = await Promise.all(
            produtos.map(async (prod: any) => {
                const { data: movs } = await supabase
                    .from("movimentacoes")
                    .select("quantidade, motivo, criada_em")
                    .eq("produto_id", prod.id)
                    .eq("tipo", "saida")
                    .gte("criada_em", dataLimiteIso);

                const saidasValidas = (movs || []).filter((m: any) => {
                    if (!m.motivo) return true;
                    const mot = m.motivo.toLowerCase();
                    return !/(perda|avaria|descarte|vencid|vencimento|quebra)/i.test(mot);
                });

                const totalSaidas = saidasValidas.reduce((acc: number, curr: any) => acc + curr.quantidade, 0);

                const dataCriacao = prod.criado_em ? new Date(prod.criado_em) : dataLimite;
                const diasDesdeCriacao = Math.max(
                    1,
                    Math.ceil((Date.now() - dataCriacao.getTime()) / (1000 * 60 * 60 * 24)),
                );
                const diasEfetivos = Math.min(diasHistorico, diasDesdeCriacao);

                const consumoMedioDiario = Number((totalSaidas / diasEfetivos).toFixed(2));

                let diasParaRuptura: number | null = null;
                let dataEstimadaEsgotamento: string | null = null;
                let statusRisco = "NORMAL";

                if (prod.quantidade <= 0) {
                    diasParaRuptura = 0;
                    statusRisco = "ESTOQUE_ZERADO";
                } else if (consumoMedioDiario > 0) {
                    diasParaRuptura = Math.floor(prod.quantidade / consumoMedioDiario);
                    const dataEsgotamento = new Date();
                    dataEsgotamento.setDate(dataEsgotamento.getDate() + diasParaRuptura);
                    dataEstimadaEsgotamento = dataEsgotamento.toISOString().split("T")[0];

                    if (diasParaRuptura <= 3) {
                        statusRisco = "CRITICO_IMINENTE";
                    } else if (diasParaRuptura <= 10 || prod.quantidade <= prod.estoque_minimo) {
                        statusRisco = "ALERTA";
                    } else {
                        statusRisco = "CONFORTAVEL";
                    }
                } else {
                    statusRisco = "SEM_CONSUMO_REGISTRADO";
                }

                const { data: itensEmAberto } = await supabase
                    .from("itens_pedido")
                    .select("quantidade, pedidos!inner(id, status, fornecedores(razao_social, nome_fantasia))")
                    .eq("produto_id", prod.id)
                    .in("pedidos.status", ["rascunho", "enviado"]);

                const qtdEmPedidosAbertos = (itensEmAberto || []).reduce(
                    (acc: number, curr: any) => acc + (curr.quantidade || 0),
                    0,
                );

                const pedidosInfo = (itensEmAberto || []).map((it: any) => {
                    const forn =
                        it.pedidos?.fornecedores?.nome_fantasia ||
                        it.pedidos?.fornecedores?.razao_social ||
                        "Fornecedor";
                    return `${it.quantidade} un. (Status: ${it.pedidos?.status} | ${forn})`;
                });

                const saldoProjetado = prod.quantidade + qtdEmPedidosAbertos;
                let diasAteRupturaProjetada: number | null = null;
                if (consumoMedioDiario > 0) {
                    diasAteRupturaProjetada = Math.floor(saldoProjetado / consumoMedioDiario);
                }

                return {
                    produto: prod.nome,
                    sku: prod.sku,
                    estoque_atual: prod.quantidade,
                    estoque_minimo: prod.estoque_minimo,
                    localizacao: prod.localizacao || "Não informada",
                    periodo_dias_analisados: diasEfetivos,
                    total_saidas_no_periodo: totalSaidas,
                    consumo_medio_diario: consumoMedioDiario,
                    dias_ate_ruptura: diasParaRuptura,
                    data_estimada_esgotamento: dataEstimadaEsgotamento,
                    status_risco: statusRisco,
                    pedidos_em_andamento: {
                        quantidade_a_receber: qtdEmPedidosAbertos,
                        pedidos: pedidosInfo,
                        saldo_projetado: saldoProjetado,
                        dias_cobertura_projetada: diasAteRupturaProjetada,
                    },
                };
            }),
        );

        if (parentNodeId) {
            tracer.updateStep({
                id: `db-rup-prod-${Date.now()}`,
                parentId: parentNodeId,
                stepType: "db_query",
                label: "PostgreSQL: produtos",
                sublabel: `${produtos.length} produtos avaliados`,
                status: "success",
                iconType: "database",
                metadata: { tabela: "produtos", total: produtos.length },
            });
            tracer.updateStep({
                id: `db-rup-movs-${Date.now() + 1}`,
                parentId: parentNodeId,
                stepType: "db_query",
                label: "PostgreSQL: movimentacoes",
                sublabel: `Histórico de saídas (${diasHistorico} dias)`,
                status: "success",
                iconType: "database",
                metadata: { tabela: "movimentacoes", tipo: "saida", dias: diasHistorico },
            });
            tracer.updateStep({
                id: `db-rup-pedidos-${Date.now() + 2}`,
                parentId: parentNodeId,
                stepType: "db_query",
                label: "PostgreSQL: itens_pedido",
                sublabel: "Verificação de ordens de compra em aberto",
                status: "success",
                iconType: "database",
                metadata: { tabela: "itens_pedido", status: ["rascunho", "enviado"] },
            });
            tracer.updateStep({
                id: `calc-rup-${Date.now() + 3}`,
                parentId: parentNodeId,
                stepType: "computation",
                label: "Cálculo Determinístico",
                sublabel: "Consumo diário médio & Saldo projetado",
                status: "success",
                iconType: "calculator",
                metadata: { formula: "consumo_medio = saidas / dias; saldo_projetado = estoque + pedidos" },
            });
        }

        return {
            periodo_base_dias: diasHistorico,
            total_produtos_analisados: resultados.length,
            resultados,
        };
    },

    consultar_curva_abc: async function (args: any, parentNodeId?: string) {
        const diasHistorico = args.dias_historico && args.dias_historico > 0 ? Number(args.dias_historico) : 90;
        const limite = args.limite && args.limite > 0 ? Number(args.limite) : 10;

        const dataLimite = new Date();
        dataLimite.setDate(dataLimite.getDate() - diasHistorico);
        const dataLimiteIso = dataLimite.toISOString();

        const { data: movs, error: movError } = await supabase
            .from("movimentacoes")
            .select("produto_id, quantidade, motivo")
            .eq("tipo", "saida")
            .gte("criada_em", dataLimiteIso);

        if (movError) {
            console.error("Erro ao consultar movimentações para Curva ABC:", movError);
            return { erro: "Falha ao calcular curva ABC." };
        }

        const { data: produtos, error: prodError } = await supabase
            .from("produtos")
            .select("id, nome, sku, preco, quantidade, estoque_minimo, localizacao");

        if (prodError || !produtos) {
            return { erro: "Falha ao consultar produtos para Curva ABC." };
        }

        const saidasPorProduto: Record<string, number> = {};
        for (const m of movs || []) {
            if (!m.produto_id) continue;
            const mot = (m.motivo || "").toLowerCase();
            if (/(perda|avaria|descarte|vencid|quebra)/i.test(mot)) continue;
            saidasPorProduto[m.produto_id] = (saidasPorProduto[m.produto_id] || 0) + (m.quantidade || 0);
        }

        const itensComValor: Array<{
            id: string;
            nome: string;
            sku: string;
            preco_unitario: number;
            estoque_atual: number;
            localizacao: string;
            quantidade_saida: number;
            valor_movimentado: number;
        }> = [];

        for (const prod of produtos) {
            const qtdSaida = saidasPorProduto[prod.id] || 0;
            const valor = qtdSaida * (prod.preco || 0);
            if (qtdSaida > 0) {
                itensComValor.push({
                    id: prod.id,
                    nome: prod.nome,
                    sku: prod.sku,
                    preco_unitario: prod.preco,
                    estoque_atual: prod.quantidade,
                    localizacao: prod.localizacao || "Não informada",
                    quantidade_saida: qtdSaida,
                    valor_movimentado: Number(valor.toFixed(2)),
                });
            }
        }

        itensComValor.sort((a, b) => b.valor_movimentado - a.valor_movimentado);
        const valorTotalPeriodo = itensComValor.reduce((acc, curr) => acc + curr.valor_movimentado, 0);

        if (valorTotalPeriodo === 0) {
            return {
                mensagem: `Nenhuma saída comercial registrada nos últimos ${diasHistorico} dias.`,
                periodo_dias: diasHistorico,
                classificacao: [],
            };
        }

        let acumulado = 0;
        let contagemA = 0;
        let contagemB = 0;
        let contagemC = 0;

        const resultadoClassificado = itensComValor.map((item, index) => {
            acumulado += item.valor_movimentado;
            const percIndividual = Number(((item.valor_movimentado / valorTotalPeriodo) * 100).toFixed(2));
            const percAcumulado = Number(((acumulado / valorTotalPeriodo) * 100).toFixed(2));

            let classe: "A" | "B" | "C" = "C";
            if (percAcumulado <= 80 || (index === 0 && percAcumulado > 80)) {
                classe = "A";
                contagemA++;
            } else if (percAcumulado <= 95) {
                classe = "B";
                contagemB++;
            } else {
                classe = "C";
                contagemC++;
            }

            return {
                ...item,
                percentual_valor: percIndividual,
                percentual_acumulado: percAcumulado,
                classe_abc: classe,
            };
        });

        if (parentNodeId) {
            tracer.updateStep({
                id: `db-abc-movs-${Date.now()}`,
                parentId: parentNodeId,
                stepType: "db_query",
                label: "PostgreSQL: movimentacoes",
                sublabel: `${movs?.length || 0} saídas nos últimos ${diasHistorico} dias`,
                status: "success",
                iconType: "database",
                metadata: { tabela: "movimentacoes", total: movs?.length },
            });
            tracer.updateStep({
                id: `db-abc-prod-${Date.now() + 1}`,
                parentId: parentNodeId,
                stepType: "db_query",
                label: "PostgreSQL: produtos",
                sublabel: `${produtos?.length || 0} produtos e preços unitários`,
                status: "success",
                iconType: "database",
                metadata: { tabela: "produtos", total: produtos?.length },
            });
            tracer.updateStep({
                id: `calc-abc-${Date.now() + 2}`,
                parentId: parentNodeId,
                stepType: "computation",
                label: "Algoritmo Curva ABC",
                sublabel: `Classificação: ${contagemA} Classe A, ${contagemB} Classe B, ${contagemC} Classe C`,
                status: "success",
                iconType: "calculator",
                metadata: {
                    valor_total: valorTotalPeriodo,
                    distribuicao: { classe_A: contagemA, classe_B: contagemB, classe_C: contagemC },
                },
            });
        }

        return {
            periodo_dias: diasHistorico,
            valor_total_movimentado: Number(valorTotalPeriodo.toFixed(2)),
            total_produtos_com_giro: itensComValor.length,
            distribuicao_resumo: {
                classe_A: `${contagemA} itens (até 80% do valor total movimentado - controle crítico)`,
                classe_B: `${contagemB} itens (~15% do valor movimentado - controle moderado)`,
                classe_C: `${contagemC} itens (~5% do valor movimentado - controle simplificado)`,
            },
            produtos_mais_relevantes: resultadoClassificado.slice(0, limite),
        };
    },

    consultar_pedidos: async function (args: any, parentNodeId?: string) {
        let query = supabase
            .from("pedidos")
            .select("id, status, valor_total, criado_em, fornecedores(razao_social, nome_fantasia)")
            .order("criado_em", { ascending: false })
            .limit(args.limite || 5);

        if (args.status) {
            const st = args.status
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .trim();

            if (st === "aberto" || st === "abertos" || st === "pendente" || st === "pendentes" || st === "em aberto") {
                query = query.in("status", ["rascunho", "enviado"]);
            } else if (st === "concluido" || st === "finalizado" || st === "recebido") {
                query = query.eq("status", "concluido");
            } else if (st === "cancelado") {
                query = query.eq("status", "cancelado");
            } else if (st === "rascunho") {
                query = query.eq("status", "rascunho");
            } else if (st === "enviado") {
                query = query.eq("status", "enviado");
            } else {
                query = query.ilike("status", `%${st}%`);
            }
        }

        const { data, error } = await query;
        if (error) {
            console.error("Erro na consulta de pedidos:", error);
            return { erro: "Falha ao consultar pedidos." };
        }

        if (parentNodeId) {
            tracer.updateStep({
                id: `db-pedidos-${Date.now()}`,
                parentId: parentNodeId,
                stepType: "db_query",
                label: "PostgreSQL: pedidos",
                sublabel: `${data?.length || 0} pedidos de compra encontrados`,
                status: "success",
                iconType: "database",
                metadata: { tabela: "pedidos", filtro: args, total: data?.length },
            });
        }

        return data;
    },

    consultar_pedidos_venda: async function (args, parentNodeId) {
        let query = supabase
            .from("pedidos_venda")
            .select("id, numero, status, valor_total, criado_em, clientes(nome)")
            .order("criado_em", { ascending: false })
            .limit(args.limite || 5);

        if (args.status) {
            query = query.eq("status", args.status.toLowerCase().trim());
        }

        const { data, error } = await query;
        if (error) {
            console.error("Erro na consulta de pedidos de venda:", error);
            return { erro: "Falha ao consultar pedidos de venda." };
        }

        if (parentNodeId) {
            tracer.updateStep({
                id: `db-pedidos-venda-${Date.now()}`,
                parentId: parentNodeId,
                stepType: "db_query",
                label: "PostgreSQL: pedidos_venda",
                sublabel: `${data?.length || 0} pedidos de venda encontrados`,
                status: "success",
                iconType: "database",
                metadata: { tabela: "pedidos_venda", filtro: args, total: data?.length },
            });
        }

        return data;
    },
};

export async function handleFunctionCall(call: any, parentNodeId?: string) {
    const handler = handlers[call.name];
    return handler ? handler(call.args, parentNodeId) : { erro: "Ferramenta não encontrada." };
}
