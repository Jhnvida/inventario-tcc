<script setup lang="ts">
definePageMeta({ titulo: "Novo Fornecedor" });

const salvando = ref(false);
const erro = ref("");

async function salvarFornecedor(payload: {
    razaoSocial: string;
    nomeFantasia: string | null;
    cnpj: string | null;
    contato: string | null;
    telefone: string | null;
    prazoMedio: number;
    ativo: boolean;
}) {
    erro.value = "";
    if (!payload.razaoSocial.trim()) {
        erro.value = "Preencha a razao social.";
        return;
    }

    if (payload.prazoMedio < 0) {
        erro.value = "Prazo medio deve ser >= 0.";
        return;
    }

    salvando.value = true;
    try {
        await $fetch("/api/fornecedores", { method: "POST", body: payload });
        await navigateTo("/fornecedores");
    } catch {
        erro.value = "Nao foi possivel salvar o fornecedor.";
    } finally {
        salvando.value = false;
    }
}
</script>

<template>
    <div class="mx-auto flex w-full max-w-4xl flex-col gap-4">
        <Cabecalho titulo="Novo Fornecedor" subtitulo="Cadastre um novo fornecedor no sistema">
            <NuxtLink to="/fornecedores" class="botao botao-ghost text-[12px]">Voltar</NuxtLink>
        </Cabecalho>

        <div class="border border-line bg-surface p-5">
            <FormFornecedor
                :erro="erro"
                :salvando="salvando"
                @cancelar="navigateTo('/fornecedores')"
                @salvar="salvarFornecedor"
            />
        </div>
    </div>
</template>
