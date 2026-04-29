<script setup lang="ts">
definePageMeta({ titulo: "Nova Movimentação" });

const salvando = ref(false);
const erro = ref("");

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
        await $fetch("/api/movimentacoes", {
            method: "POST",
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
        <Cabecalho titulo="Nova Movimentação" subtitulo="Registre uma entrada ou saída de estoque">
            <NuxtLink to="/movimentacoes" class="botao botao-ghost text-[12px]">Voltar</NuxtLink>
        </Cabecalho>

        <div class="border border-line bg-surface p-5">
            <FormMovimentacao
                :erro="erro"
                :salvando="salvando"
                @cancelar="navigateTo('/movimentacoes')"
                @salvar="salvar"
            />
        </div>
    </div>
</template>
