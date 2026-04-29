<script setup lang="ts">
definePageMeta({ titulo: "Novo Produto" });

const salvando = ref(false);
const erro = ref("");

async function salvarProduto(payload: {
    nome: string;
    sku: string;
    categoriaId: number | null;
    local: string | null;
    estoque: number;
    minimo: number;
    preco: number;
}) {
    erro.value = "";
    if (!payload.nome || !payload.sku) {
        erro.value = "Preencha nome e SKU.";
        return;
    }

    if (payload.estoque < 0 || payload.minimo < 0 || payload.preco < 0) {
        erro.value = "Valores de estoque/minimo/preco devem ser >= 0.";
        return;
    }

    salvando.value = true;
    try {
        await $fetch("/api/produtos", { method: "POST", body: payload });
        await navigateTo("/produtos");
    } catch {
        erro.value = "Nao foi possivel salvar o produto.";
    } finally {
        salvando.value = false;
    }
}
</script>

<template>
    <div class="mx-auto flex w-full max-w-4xl flex-col gap-4">
        <Cabecalho titulo="Novo Produto" subtitulo="Cadastre um novo item de estoque">
            <NuxtLink to="/produtos" class="botao botao-ghost text-[12px]">Voltar</NuxtLink>
        </Cabecalho>
        <div class="border border-line bg-surface p-5">
            <FormProduto
                :erro="erro"
                :salvando="salvando"
                @cancelar="navigateTo('/produtos')"
                @salvar="salvarProduto"
            />
        </div>
    </div>
</template>
