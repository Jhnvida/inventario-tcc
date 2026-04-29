<script setup lang="ts">
import type { Produto } from "~/types";

definePageMeta({ titulo: "Editar Produto" });

const route = useRoute();
const produtoId = computed(() => Number(route.params.id));

const { data: produtos, pending, error } = useFetch<Produto[]>("/api/produtos");
const produto = computed(() => (produtos.value || []).find((item) => item.id === produtoId.value));

const salvando = ref(false);
const erro = ref("");

const initial = computed(() => {
    if (!produto.value) return {};

    return {
        nome: produto.value.nome || "",
        sku: produto.value.sku || "",
        categoriaId: produto.value.categoriaId || null,
        local: produto.value.local || "",
        estoque: Number(produto.value.estoque || 0),
        minimo: Number(produto.value.minimo || 0),
        preco: Number(produto.value.preco || 0),
    };
});

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
        await $fetch(`/api/produtos/${produtoId.value}`, { method: "PUT", body: payload });
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
        <Cabecalho titulo="Editar Produto" subtitulo="Atualize os dados do produto selecionado">
            <NuxtLink to="/produtos" class="botao botao-ghost text-[12px]">Voltar</NuxtLink>
        </Cabecalho>

        <div v-if="pending" class="text-[13px] text-tx-soft">Carregando produto...</div>
        <div v-else-if="error || !produto" class="text-[13px] text-tx-soft">Produto nao encontrado.</div>
        <div v-else class="border border-line bg-surface p-5">
            <FormProduto
                :initial="initial"
                :erro="erro"
                :salvando="salvando"
                @cancelar="navigateTo('/produtos')"
                @salvar="salvarProduto"
            />
        </div>
    </div>
</template>
