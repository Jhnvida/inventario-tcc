<script setup lang="ts">
import type { Fornecedor } from "~/types";

definePageMeta({ titulo: "Editar Fornecedor" });

const route = useRoute();
const fornecedorId = computed(() => Number(route.params.id));

const { data: fornecedores, pending, error } = useLazyFetch<Fornecedor[]>("/api/fornecedores");
const fornecedor = computed(() => (fornecedores.value || []).find((item) => item.id === fornecedorId.value));

const salvando = ref(false);
const erro = ref("");

const initial = computed(() => {
    if (!fornecedor.value) return {};

    return {
        razaoSocial: fornecedor.value.razaoSocial || "",
        nomeFantasia: fornecedor.value.nomeFantasia || "",
        cnpj: fornecedor.value.cnpj || "",
        contato: fornecedor.value.contato || "",
        telefone: fornecedor.value.telefone || "",
        prazoMedio: Number(fornecedor.value.prazoMedio || 0),
        ativo: fornecedor.value.ativo ?? fornecedor.value.status === "ok",
    };
});

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
        await $fetch(`/api/fornecedores/${fornecedorId.value}`, { method: "PUT", body: payload });
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
        <Cabecalho titulo="Editar Fornecedor" subtitulo="Atualize os dados do fornecedor selecionado">
            <NuxtLink to="/fornecedores" class="botao botao-ghost text-[12px]">Voltar</NuxtLink>
        </Cabecalho>

        <div v-if="pending" class="text-[13px] text-tx-soft">Carregando fornecedor...</div>
        <div v-else-if="error || !fornecedor" class="text-[13px] text-tx-soft">Fornecedor nao encontrado.</div>
        <div v-else class="border border-line bg-surface p-5">
            <FormFornecedor
                :initial="initial"
                :erro="erro"
                :salvando="salvando"
                @cancelar="navigateTo('/fornecedores')"
                @salvar="salvarFornecedor"
            />
        </div>
    </div>
</template>
