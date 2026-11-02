import assert from "node:assert";
import test from "node:test";
import { ehPerdaOperacional, handleFunctionCall } from "../services/ai/toolHandlers.ts";
import { formatDate, formatDateOnly } from "../utils/formatters.ts";

test("Formatters: formatDate e formatDateOnly formatam no padrão pt-BR (America/Sao_Paulo)", () => {
    const formattedDateTime = formatDate("2026-10-01T19:45:03.773827Z");
    assert.match(formattedDateTime, /^01\/10\/2026/);
    assert.match(formattedDateTime, /16:45/);

    const formattedDateOnly = formatDateOnly("2026-10-01T19:45:03.773827Z");
    assert.strictEqual(formattedDateOnly, "01/10/2026");

    assert.strictEqual(formatDate(null), "-");
    assert.strictEqual(formatDate(undefined), "-");
    assert.strictEqual(formatDateOnly(null), "-");
});

test("RN13: ehPerdaOperacional classifica motivos de descarte, quebra e avaria corretamente", () => {
    assert.strictEqual(ehPerdaOperacional("Avaria constatada no recebimento"), true);
    assert.strictEqual(ehPerdaOperacional("Quebra acidental em estoque"), true);
    assert.strictEqual(ehPerdaOperacional("Perda por umidade"), true);
    assert.strictEqual(ehPerdaOperacional("Produto com lote vencido"), true);
    assert.strictEqual(ehPerdaOperacional("Descarte de embalagem danificada"), true);
    assert.strictEqual(ehPerdaOperacional("Ajuste por furto apurado"), true);
    assert.strictEqual(ehPerdaOperacional("Sinistro no transporte"), true);

    assert.strictEqual(ehPerdaOperacional("Venda balcão"), false);
    assert.strictEqual(ehPerdaOperacional("Saída para produção"), false);
    assert.strictEqual(ehPerdaOperacional("Transferência de setor"), false);
    assert.strictEqual(ehPerdaOperacional("Consumo interno"), false);
    assert.strictEqual(ehPerdaOperacional(null), false);
    assert.strictEqual(ehPerdaOperacional(undefined), false);
    assert.strictEqual(ehPerdaOperacional(""), false);
});

function checkRemoteDbOrSkip(result: any, t: any): boolean {
    if (
        result?.erro &&
        typeof result.erro === "string" &&
        (result.erro.includes("Falha ao") || result.erro.includes("fetch failed"))
    ) {
        t.skip(`Integração Supabase indisponível no ambiente de execução: ${result.erro}`);
        return true;
    }
    return false;
}

test("Tool Handlers: consultar_movimentacoes executa sem erro de coluna", async (t) => {
    const result = await handleFunctionCall({
        name: "consultar_movimentacoes",
        args: { tipo: "saida", limite: 5 },
    });

    if (checkRemoteDbOrSkip(result, t)) return;

    assert.strictEqual(result?.erro, undefined, "Não deve retornar erro de SQL ou coluna inexistente");
    assert.ok(Array.isArray(result), "Deve retornar um array de resultados");
});

test("Tool Handlers: consultar_movimentacoes aceita tipo acentuado 'saída'", async (t) => {
    const result = await handleFunctionCall({
        name: "consultar_movimentacoes",
        args: { tipo: "saída", limite: 3 },
    });

    if (checkRemoteDbOrSkip(result, t)) return;

    assert.strictEqual(result?.erro, undefined);
    assert.ok(Array.isArray(result));
});

test("Tool Handlers: consultar_ranking_movimentacoes executa sem erro", async (t) => {
    const result = await handleFunctionCall({
        name: "consultar_ranking_movimentacoes",
        args: { tipo: "saida", limite: 3 },
    });

    if (checkRemoteDbOrSkip(result, t)) return;

    assert.strictEqual(result?.erro, undefined);
    assert.ok(result.ranking !== undefined, "Deveria conter a chave ranking");
});

test("Tool Handlers: consultar_produtos executa sem erro", async (t) => {
    const result = await handleFunctionCall({
        name: "consultar_produtos",
        args: { limite: 3 },
    });

    if (checkRemoteDbOrSkip(result, t)) return;

    assert.strictEqual(result?.erro, undefined);
    assert.ok(Array.isArray(result));
});

test("Tool Handlers: consultar_categorias e consultar_fornecedores estão mapeadas", async (t) => {
    const categorias = await handleFunctionCall({
        name: "consultar_categorias",
        args: {},
    });
    if (checkRemoteDbOrSkip(categorias, t)) return;

    assert.strictEqual(categorias?.erro, undefined);
    assert.ok(Array.isArray(categorias));

    const fornecedores = await handleFunctionCall({
        name: "consultar_fornecedores",
        args: {},
    });
    if (checkRemoteDbOrSkip(fornecedores, t)) return;

    assert.strictEqual(fornecedores?.erro, undefined);
    assert.ok(Array.isArray(fornecedores));
});

test("Tool Handlers: analisar_previsao_ruptura executa sem erro e aplica RN13", async (t) => {
    const result = await handleFunctionCall({
        name: "analisar_previsao_ruptura",
        args: { limite: 3 },
    });

    if (checkRemoteDbOrSkip(result, t)) return;

    assert.strictEqual(result?.erro, undefined);
    assert.strictEqual(typeof result?.periodo_base_dias, "number");
    assert.ok(result?.criterio_rn13, "Deveria informar critério ativo de segregação RN13");
    if (Array.isArray(result?.resultados) && result.resultados.length > 0) {
        const primeiro = result.resultados[0];
        assert.ok("total_saidas_periodo" in primeiro);
        assert.ok("perdas_expurgadas_rn13" in primeiro);
        assert.strictEqual(typeof primeiro.perdas_expurgadas_rn13, "number");
    }
});

test("Tool Handlers: consultar_curva_abc executa sem erro", async (t) => {
    const result = await handleFunctionCall({
        name: "consultar_curva_abc",
        args: { dias_historico: 90 },
    });

    if (checkRemoteDbOrSkip(result, t)) return;

    assert.strictEqual(result?.erro, undefined);
});

test("Tool Handlers: consultar_pedidos e consultar_pedidos_venda executam sem erro", async (t) => {
    const pedidos = await handleFunctionCall({
        name: "consultar_pedidos",
        args: { limite: 2 },
    });
    if (checkRemoteDbOrSkip(pedidos, t)) return;

    assert.strictEqual(pedidos?.erro, undefined);
    assert.ok(Array.isArray(pedidos));

    const pedidosVenda = await handleFunctionCall({
        name: "consultar_pedidos_venda",
        args: { limite: 2 },
    });
    if (checkRemoteDbOrSkip(pedidosVenda, t)) return;

    assert.strictEqual(pedidosVenda?.erro, undefined);
    assert.ok(Array.isArray(pedidosVenda));
});

test("Tool Handlers: Chamada para ferramenta inexistente retorna erro tratado", async () => {
    const result = await handleFunctionCall({
        name: "ferramenta_que_nao_existe",
        args: {},
    });

    assert.ok(result.erro);
    assert.match(result.erro, /não encontrada/i);
});
