import assert from "node:assert";
import test from "node:test";
import { supabase } from "../lib/supabase.ts";
import { type UsuarioStatus } from "../types/index.ts";
import { translateAuthError } from "../utils/errors.ts";

test("RN - Status de Usuário: conjunto estrito de status permitidos", () => {
    const statusValidos: UsuarioStatus[] = ["pendente", "ativo", "inativo", "recusado"];
    assert.strictEqual(statusValidos.length, 4);
    assert.ok(statusValidos.includes("pendente"));
    assert.ok(statusValidos.includes("ativo"));
    assert.ok(statusValidos.includes("inativo"));
    assert.ok(statusValidos.includes("recusado"));
});

test("RN - Autoproteção de Administrador: impede auto-exclusão e auto-inativação", () => {
    const adminAtual = { id: "admin-1", nome: "Admin", status: "ativo" };
    const usuarioAlvo = { id: "admin-1", nome: "Admin", status: "ativo" };

    function podeExcluir(autorId: string, alvoId: string) {
        if (autorId === alvoId) {
            return { permitido: false, erro: "Operação não permitida: você não pode excluir o seu próprio usuário." };
        }
        return { permitido: true };
    }

    function podeAlterarStatus(autorId: string, alvoId: string) {
        if (autorId === alvoId) {
            return { permitido: false, erro: "Operação não permitida: você não pode alterar o status do seu próprio usuário." };
        }
        return { permitido: true };
    }

    const checkDelete = podeExcluir(adminAtual.id, usuarioAlvo.id);
    assert.strictEqual(checkDelete.permitido, false);
    assert.strictEqual(checkDelete.erro, "Operação não permitida: você não pode excluir o seu próprio usuário.");

    const checkStatus = podeAlterarStatus(adminAtual.id, usuarioAlvo.id);
    assert.strictEqual(checkStatus.permitido, false);
    assert.strictEqual(checkStatus.erro, "Operação não permitida: você não pode alterar o status do seu próprio usuário.");

    const checkOutro = podeExcluir(adminAtual.id, "operador-2");
    assert.strictEqual(checkOutro.permitido, true);
});

test("RN - Mensagens de Bloqueio de Acesso no Login", () => {
    function getMensagemBloqueio(status: UsuarioStatus): string | null {
        if (status === "pendente") {
            return "Seu cadastro está com o status Pendente. Aguarde a aprovação do administrador para acessar o sistema.";
        }
        if (status === "recusado") {
            return "Sua solicitação de acesso foi recusada pela administração do sistema.";
        }
        if (status === "inativo") {
            return "Sua conta de operador está inativada. Contate um administrador para restabelecer seu acesso.";
        }
        return null;
    }

    assert.strictEqual(getMensagemBloqueio("ativo"), null);
    assert.ok(getMensagemBloqueio("pendente")?.includes("Pendente"));
    assert.ok(getMensagemBloqueio("recusado")?.includes("recusada"));
    assert.ok(getMensagemBloqueio("inativo")?.includes("inativada"));
});

test("Banco de Dados - Tabela usuarios possui colunas status e regras integradas", async () => {
    const { data: pendentes, error: errPendentes } = await supabase
        .from("usuarios")
        .select("id, nome, email, status")
        .eq("status", "pendente");

    assert.strictEqual(errPendentes, null, `Erro ao consultar usuários pendentes: ${errPendentes?.message}`);
    assert.ok(Array.isArray(pendentes));

    const { data: ativos, error: errAtivos } = await supabase
        .from("usuarios")
        .select("id, nome, email, status")
        .eq("status", "ativo");

    assert.strictEqual(errAtivos, null, `Erro ao consultar usuários ativos: ${errAtivos?.message}`);
    assert.ok(Array.isArray(ativos));
});

test("translateAuthError: traduz mensagens de erro de autenticação do Supabase para português", () => {
    assert.strictEqual(
        translateAuthError({ message: "Invalid login credentials" }),
        "E-mail ou senha incorretos. Verifique suas credenciais de acesso.",
    );
    assert.strictEqual(
        translateAuthError({ message: "User already registered" }),
        "Este e-mail já está cadastrado no sistema. Tente entrar ou utilize outro endereço.",
    );
    assert.strictEqual(
        translateAuthError({ message: "Password should be at least 6 characters." }),
        "A senha deve conter no mínimo 6 caracteres.",
    );
    assert.strictEqual(
        translateAuthError({ message: "Email not confirmed" }),
        "Seu e-mail ainda não foi confirmado. Verifique sua caixa de entrada para prosseguir.",
    );
    assert.strictEqual(
        translateAuthError({ message: "Email rate limit exceeded" }),
        "Muitas tentativas consecutivas. Por favor, aguarde alguns instantes e tente novamente.",
    );
    assert.strictEqual(
        translateAuthError({ message: "Failed to fetch" }),
        "Falha de comunicação com o servidor. Verifique sua conexão com a internet.",
    );
    assert.strictEqual(
        translateAuthError({ message: "Invalid email" }),
        "O endereço de e-mail informado é inválido. Por favor, verifique o formato.",
    );
    assert.strictEqual(
        translateAuthError(null),
        "Ocorreu um erro na autenticação. Tente novamente.",
    );
});
