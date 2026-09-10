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
};

export async function handleFunctionCall(call: any) {
    const handler = handlers[call.name];
    return handler ? handler(call.args) : { error: "Ferramenta não encontrada" };
}
