import { supabase } from "../../lib/supabase";

const handlers: Record<string, (args: any) => Promise<any>> = {
    consultar_produtos: async function (args) {
        const { data } = await supabase
            .from("produtos")
            .select("nome, sku, preco, quantidade, estoque_minimo, categorias(nome)")
            .order("quantidade", { ascending: true });

        if (args.filtro_estoque === "baixo") {
            return data?.filter((p: any) => p.quantidade > 0 && p.quantidade <= p.estoque_minimo);
        }

        if (args.filtro_estoque === "zerado") {
            return data?.filter((p: any) => p.quantidade === 0);
        }

        return data;
    },

    consultar_resumo_estoque: async function () {
        const { data } = await supabase.from("produtos").select("quantidade, estoque_minimo, preco");

        const totalUnicos = data?.length || 0;
        const totalItens = data?.reduce((acc, curr) => acc + curr.quantidade, 0) || 0;
        const valorTotal = data?.reduce((acc, curr) => acc + curr.quantidade * curr.preco, 0) || 0;
        const estoqueBaixo = data?.filter((p) => p.quantidade <= p.estoque_minimo).length || 0;
        const estoqueZerado = data?.filter((p) => p.quantidade === 0).length || 0;

        return { totalUnicos, totalItens, valorTotal, estoqueBaixo, estoqueZerado };
    },

    consultar_categorias: async function () {
        const { data } = await supabase.from("categorias").select("nome");
        return data;
    },

    consultar_fornecedores: async function () {
        const { data } = await supabase.from("fornecedores").select("razao_social, nome_fantasia, status");
        return data;
    },

    analisar_movimentacao: async function (args: { produto_id: string; dias_historico?: number }) {
        if (!args.produto_id) return { error: "O parâmetro produto_id é obrigatório." };

        const dias = args.dias_historico || 30;
        const dataLimite = new Date();
        dataLimite.setDate(dataLimite.getDate() - dias);

        const { data: produto, error: errorProd } = await supabase
            .from("produtos")
            .select("quantidade, estoque_minimo, nome")
            .eq("id", args.produto_id)
            .single();

        if (errorProd || !produto) return { error: "Produto não encontrado." };

        const { data: movimentacoes, error: errorMov } = await supabase
            .from("movimentacoes")
            .select("quantidade, motivo, criada_em")
            .eq("produto_id", args.produto_id)
            .eq("tipo", "saida")
            .gte("criada_em", dataLimite.toISOString());

        if (errorMov) return { error: "Erro ao buscar histórico de movimentações." };

        const regexIgnorar = /ajuste|devolu|perda|venci|furto|quebra|descarte/i;
        const saidasValidas = (movimentacoes || []).filter((m) => !m.motivo || !regexIgnorar.test(m.motivo));

        const totalConsumido = saidasValidas.reduce((acc, curr) => acc + curr.quantidade, 0);

        let diasEfetivos = dias;
        if (saidasValidas.length > 0) {
            const datas = saidasValidas.map((m) => new Date(m.criada_em).getTime());
            const dataMaisAntiga = new Date(Math.min(...datas));
            const dataAtual = new Date();

            const diffTime = Math.abs(dataAtual.getTime() - dataMaisAntiga.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays > 0 && diffDays < dias) {
                diasEfetivos = diffDays;
            } else if (diffDays === 0) {
                diasEfetivos = 1;
            }
        }

        if (totalConsumido === 0) {
            return {
                produto: produto.nome,
                periodo_solicitado_dias: dias,
                periodo_efetivo_dias: diasEfetivos,
                quantidade_total_consumida: 0,
                estoque_atual: produto.quantidade,
                estoque_minimo: produto.estoque_minimo,
                estimativa_dias_ruptura: null,
                classificacao_risco: "Sem movimentação",
                mensagem: "Não houve consumo válido registrado para este produto no período analisado.",
            };
        }

        const consumoMedioDiario = totalConsumido / diasEfetivos;
        const consumoMedioMensal = consumoMedioDiario * 30;
        const diasAteRuptura = Math.floor(produto.quantidade / consumoMedioDiario);

        let risco = "Normal";
        if (produto.quantidade <= produto.estoque_minimo || diasAteRuptura <= 7) {
            risco = "Crítico";
        } else if (diasAteRuptura <= 15) {
            risco = "Atenção";
        }

        return {
            produto: produto.nome,
            periodo_solicitado_dias: dias,
            periodo_efetivo_dias: diasEfetivos,
            quantidade_total_consumida: totalConsumido,
            consumo_medio_diario: Number(consumoMedioDiario.toFixed(2)),
            consumo_medio_mensal_estimado: Number(consumoMedioMensal.toFixed(2)),
            estoque_atual: produto.quantidade,
            estoque_minimo: produto.estoque_minimo,
            estimativa_dias_ruptura: diasAteRuptura,
            classificacao_risco: risco,
        };
    },
};

export async function handleFunctionCall(call: any) {
    const handler = handlers[call.name];
    return handler ? handler(call.args) : { error: "Ferramenta não encontrada" };
}
