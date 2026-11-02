import assert from "node:assert";
import test from "node:test";
import { handleFunctionCall } from "../services/ai/toolHandlers.ts";
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

test("Tool Handlers: consultar_movimentacoes executa sem erro de coluna", async () => {
    const result = await handleFunctionCall({
        name: "consultar_movimentacoes",
        args: { tipo: "saida", limite: 5 },
    });

    assert.strictEqual(result?.erro, undefined, "Não deve retornar erro de SQL ou coluna inexistente");
    assert.ok(Array.isArray(result), "Deve retornar um array de resultados");
});

test("Tool Handlers: consultar_movimentacoes aceita tipo acentuado 'saída'", async () => {
    const result = await handleFunctionCall({
        name: "consultar_movimentacoes",
        args: { tipo: "saída", limite: 3 },
    });

    assert.strictEqual(result?.erro, undefined);
    assert.ok(Array.isArray(result));
});

test("Tool Handlers: consultar_ranking_movimentacoes executa sem erro", async () => {
    const result = await handleFunctionCall({
        name: "consultar_ranking_movimentacoes",
        args: { tipo: "saida", limite: 3 },
    });

    assert.strictEqual(result?.erro, undefined);
    assert.ok(result.ranking !== undefined, "Deveria conter a chave ranking");
});

test("Tool Handlers: consultar_produtos executa sem erro", async () => {
    const result = await handleFunctionCall({
        name: "consultar_produtos",
        args: { limite: 3 },
    });

    assert.strictEqual(result?.erro, undefined);
    assert.ok(Array.isArray(result));
});

test("Tool Handlers: consultar_categorias e consultar_fornecedores estão mapeadas", async () => {
    const categorias = await handleFunctionCall({
        name: "consultar_categorias",
        args: {},
    });
    assert.strictEqual(categorias?.erro, undefined);
    assert.ok(Array.isArray(categorias));

    const fornecedores = await handleFunctionCall({
        name: "consultar_fornecedores",
        args: {},
    });
    assert.strictEqual(fornecedores?.erro, undefined);
    assert.ok(Array.isArray(fornecedores));
});

test("Tool Handlers: analisar_previsao_ruptura executa sem erro", async () => {
    const result = await handleFunctionCall({
        name: "analisar_previsao_ruptura",
        args: { limite: 3 },
    });

    assert.strictEqual(result?.erro, undefined);
});

test("Tool Handlers: consultar_curva_abc executa sem erro", async () => {
    const result = await handleFunctionCall({
        name: "consultar_curva_abc",
        args: { dias_historico: 90 },
    });

    assert.strictEqual(result?.erro, undefined);
});

test("Tool Handlers: consultar_pedidos e consultar_pedidos_venda executam sem erro", async () => {
    const pedidos = await handleFunctionCall({
        name: "consultar_pedidos",
        args: { limite: 2 },
    });
    assert.strictEqual(pedidos?.erro, undefined);
    assert.ok(Array.isArray(pedidos));

    const pedidosVenda = await handleFunctionCall({
        name: "consultar_pedidos_venda",
        args: { limite: 2 },
    });
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
