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

    consultar_pedidos: async function (args) {
        let query = supabase
            .from("pedidos")
            .select("status, valor_total, criado_em, fornecedores(nome_fantasia)")
            .order("criado_em", { ascending: false })
            .limit(args.limite || 5);

        if (args.status) {
            query = query.ilike("status", `%${args.status}%`);
        }

        const { data, error } = await query;
        if (error) {
            console.error("Erro na consulta de pedidos:", error);
            return { erro: "Falha ao consultar pedidos." };
        }

        return data;
    },
};

export async function handleFunctionCall(call: any) {
    const handler = handlers[call.name];
    return handler ? handler(call.args) : { erro: "Ferramenta não encontrada." };
}
