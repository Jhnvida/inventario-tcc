<script setup lang="ts">
definePageMeta({ titulo: "Editar Pedido" });

const route = useRoute();
const pedidoId = computed(() => Number(route.params.id));

const {
    data: pedido,
    pending,
    error,
} = useFetch<{
    id: number;
    numero: string;
    fornecedorId: number;
    previsao: string | null;
    observacoes: string | null;
    itens: Array<{ produtoId: number; quantidade: number; precoUnitario: number }>;
}>(() => `/api/pedidos/${pedidoId.value}`);

const salvando = ref(false);
const erro = ref("");

const initial = computed(() => {
    if (!pedido.value) return {};

    return {
        fornecedorId: pedido.value.fornecedorId,
        previsao: pedido.value.previsao || "",
        observacoes: pedido.value.observacoes || "",
        itens: pedido.value.itens,
    };
});

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
        await $fetch(`/api/pedidos/${pedidoId.value}`, {
            method: "PUT",
            body: payload,
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
        <Cabecalho titulo="Editar Pedido" subtitulo="Atualize fornecedor, previsao e itens do pedido">
            <NuxtLink to="/pedidos" class="botao botao-ghost text-[12px]">Voltar</NuxtLink>
        </Cabecalho>

        <div v-if="pending" class="text-[13px] text-tx-soft">Carregando pedido...</div>
        <div v-else-if="error || !pedido" class="text-[13px] text-tx-soft">Pedido nao encontrado.</div>
        <div v-else class="border border-line bg-surface p-5">
            <FormPedido
                :initial="initial"
                :erro="erro"
                :salvando="salvando"
                @cancelar="navigateTo('/pedidos')"
                @salvar="salvarPedido"
            />
        </div>
    </div>
</template>
