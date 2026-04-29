<script setup lang="ts">
definePageMeta({ titulo: "Editar Movimentação" });

const route = useRoute();
const movimentacaoId = computed(() => Number(route.params.id));

const {
    data: movimentacao,
    pending,
    error,
} = useFetch<{
    id: number;
    produtoId: number;
    tipo: "entrada" | "saida";
    quantidade: number;
    observacao: string | null;
    responsavelId: number;
    pedidoId: number | null;
}>(() => `/api/movimentacoes/${movimentacaoId.value}`);

const salvando = ref(false);
const erro = ref("");

const initial = computed(() => {
    if (!movimentacao.value) return {};

    return {
        produtoId: movimentacao.value.produtoId,
        tipo: movimentacao.value.tipo,
        quantidade: movimentacao.value.quantidade,
        observacao: movimentacao.value.observacao || "",
        responsavelId: movimentacao.value.responsavelId,
        pedidoId: movimentacao.value.pedidoId,
    };
});

async function salvar(payload: {
    produtoId: number;
    tipo: "entrada" | "saida";
    quantidade: number;
    observacao: string | null;
    responsavelId: number;
    pedidoId: number | null;
}) {
    erro.value = "";
    if (!payload.produtoId || !payload.responsavelId || payload.quantidade <= 0) {
        erro.value = "Preencha produto, responsavel e quantidade.";
        return;
    }

    salvando.value = true;
    try {
        await $fetch(`/api/movimentacoes/${movimentacaoId.value}`, {
            method: "PUT",
            body: payload,
        });
        await navigateTo("/movimentacoes");
    } catch {
        erro.value = "Nao foi possivel salvar a movimentacao.";
    } finally {
        salvando.value = false;
    }
}
</script>

<template>
    <div class="mx-auto flex w-full max-w-4xl flex-col gap-4">
        <Cabecalho titulo="Editar Movimentação" subtitulo="Ajuste os dados da movimentação selecionada">
            <NuxtLink to="/movimentacoes" class="botao botao-ghost text-[12px]">Voltar</NuxtLink>
        </Cabecalho>

        <div v-if="pending" class="text-[13px] text-tx-soft">Carregando movimentacao...</div>
        <div v-else-if="error || !movimentacao" class="text-[13px] text-tx-soft">Movimentacao nao encontrada.</div>
        <div v-else class="border border-line bg-surface p-5">
            <FormMovimentacao
                :initial="initial"
                :erro="erro"
                :salvando="salvando"
                @cancelar="navigateTo('/movimentacoes')"
                @salvar="salvar"
            />
        </div>
    </div>
</template>
