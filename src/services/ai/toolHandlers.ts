import { supabase } from "../../lib/supabase";

export const REFUSAL_MESSAGE =
    "Posso ajudar com informações e operações relacionadas ao inventário do sistema (produtos, estoque, movimentações, pedidos, fornecedores e relatórios). O que você gostaria de consultar?";

const handlers: Record<string, (args: any) => Promise<any>> = {
    recusar_fora_do_escopo: async function (args) {
        return {
            recusado: true,
            mensagem: REFUSAL_MESSAGE,
            motivo: args?.motivo || "Assunto fora do escopo do inventário.",
        };
    },

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

    consultar_resumo_estoque: async function (_args?: any) {
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

        return {
            total_produtos_cadastrados: totalUnicos,
            total_itens_em_estoque: totalItens,
            valor_total_financeiro: Number(valorTotal.toFixed(2)),
            produtos_com_estoque_baixo: estoqueBaixo,
            produtos_zerados: estoqueZerado,
        };
    },

    consultar_dados_gerais: async function () {
        const [catRes, fornRes] = await Promise.all([
            supabase.from("categorias").select("nome"),
            supabase.from("fornecedores").select("razao_social, nome_fantasia"),
        ]);

        return {
            categorias: catRes.data?.map((c) => c.nome) || [],
            fornecedores: fornRes.data?.map((f) => f.nome_fantasia || f.razao_social) || [],
        };
    },

    consultar_movimentacoes: async function (args: any) {
        let query = supabase
            .from("movimentacoes")
            .select("id, tipo, quantidade, criado_em, produtos(nome, sku)")
            .order("criado_em", { ascending: false })
            .limit(args.limite || 5);

        if (args.tipo) {
            query = query.eq("tipo", args.tipo);
        }

        const { data, error } = await query;
        if (error) {
            console.error("Erro na consulta de movimentações:", error);
            return { erro: "Falha ao consultar movimentações." };
        }

        return data;
    },

    consultar_produtos_mais_movimentados: async function (args: any) {
        const dias = args.dias || 30;
        const dataLimite = new Date();
        dataLimite.setDate(dataLimite.getDate() - dias);

        let query = supabase
            .from("movimentacoes")
            .select("produto_id, quantidade, produtos(nome)")
            .gte("criado_em", dataLimite.toISOString());

        if (args.tipo) {
            query = query.eq("tipo", args.tipo);
        }

        const { data, error } = await query;
        if (error) {
            console.error("Erro na consulta de mais movimentados:", error);
            return { erro: "Falha ao consultar histórico de movimentação." };
        }

        const acumulador: Record<string, { nome: string; total: number }> = {};
        data?.forEach((mov: any) => {
            const pId = mov.produto_id;
            const pNome = mov.produtos?.nome || "Desconhecido";
            if (!acumulador[pId]) {
                acumulador[pId] = { nome: pNome, total: 0 };
            }
            acumulador[pId].total += mov.quantidade;
        });

        const ranking = Object.values(acumulador)
            .sort((a, b) => b.total - a.total)
            .slice(0, args.limite || 5);

        return {
            periodo_dias: dias,
            tipo_movimentacao: args.tipo || "todas",
            ranking,
        };
    },

    consultar_previsao_ruptura: async function (args: any) {
        const diasHistorico = args.dias_historico || 30;
        const limiteApenasCriticos = args.apenas_criticos ?? true;

        const dataInicioHistorico = new Date();
        dataInicioHistorico.setDate(dataInicioHistorico.getDate() - diasHistorico);

        let queryProdutos = supabase
            .from("produtos")
            .select("id, nome, sku, quantidade, estoque_minimo, preco, localizacao, categorias(nome)");

        if (args.termo_busca) {
            queryProdutos = queryProdutos.or(`nome.ilike.%${args.termo_busca}%,sku.ilike.%${args.termo_busca}%`);
        }

        const { data: produtosData, error: errProdutos } = await queryProdutos;
        if (errProdutos || !produtosData) {
            console.error("Erro ao buscar produtos para previsão:", errProdutos);
            return { erro: "Falha ao obter lista de produtos." };
        }

        let produtos = produtosData;
        if (limiteApenasCriticos && !args.termo_busca) {
            produtos = produtos.filter((p) => p.quantidade <= p.estoque_minimo);
        }

        if (produtos.length === 0) {
            return {
                mensagem: "Nenhum produto em situação crítica encontrado para o período ou critérios informados.",
                resultados: [],
            };
        }

        const produtoIds = produtos.map((p) => p.id);

        const { data: movsData } = await supabase
            .from("movimentacoes")
            .select("produto_id, quantidade")
            .eq("tipo", "saida")
            .in("produto_id", produtoIds)
            .gte("criado_em", dataInicioHistorico.toISOString());

        const saidasPorProduto: Record<string, number> = {};
        movsData?.forEach((m: any) => {
            saidasPorProduto[m.produto_id] = (saidasPorProduto[m.produto_id] || 0) + m.quantidade;
        });

        const { data: pedidosItensData } = await supabase
            .from("itens_pedido")
            .select("produto_id, quantidade, pedidos!inner(status, id, data_pedido)")
            .in("produto_id", produtoIds);

        const pedidosEmAbertoPorProduto: Record<
            string,
            { totalQtd: number; pedidos: Array<{ id: string; status: string; quantidade: number }> }
        > = {};

        pedidosItensData?.forEach((item: any) => {
            const status = item.pedidos?.status;
            if (status === "rascunho" || status === "enviado") {
                if (!pedidosEmAbertoPorProduto[item.produto_id]) {
                    pedidosEmAbertoPorProduto[item.produto_id] = { totalQtd: 0, pedidos: [] };
                }
                pedidosEmAbertoPorProduto[item.produto_id].totalQtd += item.quantidade;
                pedidosEmAbertoPorProduto[item.produto_id].pedidos.push({
                    id: item.pedidos.id,
                    status: item.pedidos.status,
                    quantidade: item.quantidade,
                });
            }
        });

        const resultados = await Promise.all(
            produtos.map(async (p) => {
                const totalSaidas = saidasPorProduto[p.id] || 0;
                const consumoDiarioMedio = Number((totalSaidas / diasHistorico).toFixed(2));

                let diasAteRupturaAtual: number | null = null;
                let dataEstimadaRuptura: string | null = null;

                if (p.quantidade === 0) {
                    diasAteRupturaAtual = 0;
                    dataEstimadaRuptura = "Estoque já zerado";
                } else if (consumoDiarioMedio > 0) {
                    diasAteRupturaAtual = Math.floor(p.quantidade / consumoDiarioMedio);
                    const dataPrev = new Date();
                    dataPrev.setDate(dataPrev.getDate() + diasAteRupturaAtual);
                    dataEstimadaRuptura = dataPrev.toISOString().split("T")[0];
                } else {
                    diasAteRupturaAtual = null;
                    dataEstimadaRuptura = "Sem saídas no período (sem previsão de esgotamento)";
                }

                const infoPedidos = pedidosEmAbertoPorProduto[p.id];
                const qtdEmPedidosAbertos = infoPedidos?.totalQtd || 0;
                const pedidosInfo = infoPedidos?.pedidos || [];

                const saldoProjetado = p.quantidade + qtdEmPedidosAbertos;
                let diasAteRupturaProjetada: number | null = null;
                if (consumoDiarioMedio > 0) {
                    diasAteRupturaProjetada = Math.floor(saldoProjetado / consumoDiarioMedio);
                }

                let statusRisco = "OK";
                if (p.quantidade === 0) {
                    statusRisco = "RUPTURA_IMINENTE_ZERADO";
                } else if (diasAteRupturaAtual !== null && diasAteRupturaAtual <= 7) {
                    statusRisco = "CRITICO_7_DIAS";
                } else if (p.quantidade <= p.estoque_minimo) {
                    statusRisco = "ABAIXO_DO_MINIMO";
                }

                return {
                    produto: p.nome,
                    sku: p.sku,
                    categoria: (p.categorias as any)?.nome || "Sem categoria",
                    estoque_atual: p.quantidade,
                    estoque_minimo: p.estoque_minimo,
                    total_saidas_periodo: totalSaidas,
                    consumo_diario_medio: consumoDiarioMedio,
                    dias_ate_esgotamento: diasAteRupturaAtual,
                    data_prevista_esgotamento: dataEstimadaRuptura,
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

        return {
            periodo_base_dias: diasHistorico,
            total_produtos_analisados: resultados.length,
            resultados,
        };
    },

    consultar_curva_abc: async function (args: any) {
        const diasHistorico = args.dias || 90;
        const limite = args.limite || 20;

        const dataInicio = new Date();
        dataInicio.setDate(dataInicio.getDate() - diasHistorico);

        const { data: movs, error: errMovs } = await supabase
            .from("movimentacoes")
            .select("produto_id, quantidade")
            .eq("tipo", "saida")
            .gte("criado_em", dataInicio.toISOString());

        if (errMovs) {
            console.error("Erro ao buscar saídas para Curva ABC:", errMovs);
            return { erro: "Falha ao buscar movimentações para cálculo da Curva ABC." };
        }

        const { data: produtos, error: errProd } = await supabase
            .from("produtos")
            .select("id, nome, sku, preco, quantidade, estoque_minimo, categorias(nome)");

        if (errProd || !produtos) {
            console.error("Erro ao buscar produtos para Curva ABC:", errProd);
            return { erro: "Falha ao buscar catálogo de produtos." };
        }

        const consumoQtdPorProduto: Record<string, number> = {};
        movs?.forEach((m: any) => {
            consumoQtdPorProduto[m.produto_id] = (consumoQtdPorProduto[m.produto_id] || 0) + m.quantidade;
        });

        const itensComValor = produtos
            .map((p) => {
                const qtdConsumida = consumoQtdPorProduto[p.id] || 0;
                const valorConsumido = Number((qtdConsumida * (p.preco || 0)).toFixed(2));
                return {
                    id: p.id,
                    nome: p.nome,
                    sku: p.sku,
                    categoria: (p.categorias as any)?.nome || "Sem categoria",
                    preco_unitario: p.preco,
                    estoque_atual: p.quantidade,
                    estoque_minimo: p.estoque_minimo,
                    quantidade_consumida: qtdConsumida,
                    valor_total_consumido: valorConsumido,
                };
            })
            .filter((item) => item.quantidade_consumida > 0);

        if (itensComValor.length === 0) {
            return {
                periodo_dias: diasHistorico,
                mensagem:
                    "Nenhuma movimentação de saída registrada nos últimos " +
                    diasHistorico +
                    " dias para classificar a Curva ABC.",
                distribuicao: { classe_A: 0, classe_B: 0, classe_C: 0 },
                produtos_classificados: [],
            };
        }

        itensComValor.sort((a, b) => b.valor_total_consumido - a.valor_total_consumido);

        const valorTotalPeriodo = itensComValor.reduce((acc, curr) => acc + curr.valor_total_consumido, 0);

        let acumulado = 0;
        let contagemA = 0;
        let contagemB = 0;
        let contagemC = 0;

        const resultadoClassificado = itensComValor.map((item) => {
            acumulado += item.valor_total_consumido;
            const percAcumulado = Number(((acumulado / valorTotalPeriodo) * 100).toFixed(2));
            const percIndividual = Number(((item.valor_total_consumido / valorTotalPeriodo) * 100).toFixed(2));

            let classe: "A" | "B" | "C" = "C";
            if (percAcumulado <= 80 || (percAcumulado - percIndividual < 80 && contagemA === 0)) {
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
                nome: item.nome,
                sku: item.sku,
                categoria: item.categoria,
                estoque_atual: item.estoque_atual,
                quantidade_saidas: item.quantidade_consumida,
                valor_movimentado: item.valor_total_consumido,
                percentual_sobre_total: percIndividual,
                percentual_acumulado: percAcumulado,
                classe_abc: classe,
            };
        });

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

    consultar_pedidos: async function (args: any) {
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

    consultar_pedidos_venda: async function (args: any) {
        let query = supabase
            .from("pedidos_venda")
            .select("id, status, valor_total, criado_em, clientes(nome, cpf_cnpj)")
            .order("criado_em", { ascending: false })
            .limit(args.limite || 5);

        if (args.status) {
            const st = args.status
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .trim();

            if (st === "aberto" || st === "abertos" || st === "pendente" || st === "pendentes" || st === "em aberto") {
                query = query.in("status", ["rascunho", "aprovado"]);
            } else if (st === "concluido" || st === "finalizado" || st === "entregue") {
                query = query.eq("status", "concluido");
            } else if (st === "cancelado") {
                query = query.eq("status", "cancelado");
            } else if (st === "rascunho") {
                query = query.eq("status", "rascunho");
            } else if (st === "aprovado") {
                query = query.eq("status", "aprovado");
            } else {
                query = query.ilike("status", `%${st}%`);
            }
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
