import assert from "node:assert";
import test from "node:test";
import { supabase } from "../lib/supabase.ts";
import { translateDbError } from "../utils/errors.ts";

test("translateDbError: mapeia codigos Postgres conhecidos para mensagens amigaveis", () => {
    assert.strictEqual(
        translateDbError({ code: "23503" }),
        "Não é possível excluir este registro porque ele possui histórico (movimentações ou pedidos associados).",
    );
    assert.strictEqual(
        translateDbError({ code: "23505" }),
        "Este registro já está cadastrado no sistema (valor duplicado).",
    );
    assert.strictEqual(
        translateDbError({ code: "23514" }),
        "Valor inválido informado (verifique se a quantidade é maior que zero).",
    );
    assert.strictEqual(
        translateDbError({ message: "Custom database error" }),
        "Custom database error",
    );
    assert.strictEqual(
        translateDbError(null),
        "Ocorreu um erro desconhecido.",
    );
});

test("Categorias & Usuarios: consultas com filtros de busca nao estouram sintaxe no Supabase", async () => {
    const { error: catError } = await supabase
        .from("categorias")
        .select("*", { count: "exact" })
        .ilike("nome", "%teste%")
        .order("nome", { ascending: true })
        .range(0, 9);

    assert.strictEqual(catError, null, `Erro ao consultar categorias com filtro: ${catError?.message}`);

    const testCases = [
        "teste",
        "Silva, Maria",
        'Ana "Admin"',
        "Carlos (Operador)",
        "operador@empresa.com",
        "10%",
    ];

    for (const input of testCases) {
        const term = input.trim().replace(/"/g, "");
        const { error: userError } = await supabase
            .from("usuarios")
            .select("*", { count: "exact" })
            .or(`nome.ilike."%${term}%",email.ilike."%${term}%"`)
            .order("nome", { ascending: true })
            .range(0, 9);

        assert.strictEqual(
            userError,
            null,
            `Erro ao consultar usuarios com termo "${input}": ${userError?.message}`,
        );
    }
});
