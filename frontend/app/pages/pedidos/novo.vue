<script setup lang="ts">
definePageMeta({ titulo: "Novo Pedido" });

const salvando = ref(false);
const erro = ref("");

async function salvarPedido(payload: {
    fornecedorId: number;
    previsao: string | null;
    observacoes: string | null;
    itens: Array<{ produtoId: number; quantidade: number; precoUnitario: number }>;
}) {
    erro.value = "";

    if (!payload.fornecedorId || payload.itens.length === 0) {
        erro.value = "Preencha fornecedor e itens.";
        return;
    }
    if (payload.itens.some((item) => !item.produtoId || item.quantidade <= 0 || item.precoUnitario < 0)) {
        erro.value = "Revise os itens informados.";
        return;
    }

    salvando.value = true;
    try {
        await $fetch("/api/pedidos", {
            method: "POST",
            body: {
                ...payload,
                criadoPor: 1,
            },
        });
        await navigateTo("/pedidos");
    } catch {
        erro.value = "Nao foi possivel salvar o pedido.";
    } finally {
        salvando.value = false;
    }
}
</script>

<template>
    <div class="mx-auto flex w-full max-w-4xl flex-col gap-4">
        <Cabecalho titulo="Novo Pedido" subtitulo="Crie um pedido de compra com itens e previsao">
            <NuxtLink to="/pedidos" class="botao botao-ghost text-[12px]">Voltar</NuxtLink>
        </Cabecalho>

        <div class="border border-line bg-surface p-5">
            <FormPedido :erro="erro" :salvando="salvando" @cancelar="navigateTo('/pedidos')" @salvar="salvarPedido" />
        </div>
    </div>
</template>
