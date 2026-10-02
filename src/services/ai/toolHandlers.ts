import { supabase } from "../../lib/supabase";

const handlers: Record<string, (args: any) => Promise<any>> = {
    consultar_produtos: async function (args) {
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

        if (args.filtro_estoque === "baixo") {
            return data?.filter((p: any) => p.quantidade > 0 && p.quantidade <= p.estoque_minimo);
        }

        if (args.filtro_estoque === "zerado") {
            return data?.filter((p: any) => p.quantidade === 0);
        }

        return data;
    },

    consultar_resumo_estoque: async function () {
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

    analisar_previsao_ruptura: async function (args) {
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
                };
            }),
        );

        return {
            periodo_base_dias: diasHistorico,
            total_produtos_analisados: resultados.length,
            resultados,
        };
    },

    consultar_pedidos: async function (args) {
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

        return data;
    },

    consultar_pedidos_venda: async function (args) {
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

        return data;
    },
};

export async function handleFunctionCall(call: any) {
    const handler = handlers[call.name];
    return handler ? handler(call.args) : { erro: "Ferramenta não encontrada." };
}
