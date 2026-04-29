<script setup lang="ts">
import type { Fornecedor } from "~/types";

definePageMeta({ titulo: "Fornecedores" });

const { data: fornecedores, pending, error, refresh } = useLazyFetch<Fornecedor[]>("/api/fornecedores");
const busca = ref("");

const lista = computed(() => {
    const termo = busca.value.trim().toLowerCase();

    return (fornecedores.value || []).filter((fornecedor) => {
        if (!termo) return true;
        return (
            fornecedor.razaoSocial.toLowerCase().includes(termo) ||
            (fornecedor.nomeFantasia || "").toLowerCase().includes(termo) ||
            (fornecedor.cnpj || "").toLowerCase().includes(termo)
        );
    });
});

async function excluirFornecedor(id: number) {
    if (!confirm("Deseja remover este fornecedor?")) return;

    try {
        await $fetch(`/api/fornecedores/${id}`, { method: "DELETE" });
        await refresh();
    } catch {
        alert("Nao foi possivel remover o fornecedor.");
    }
}
</script>

<template>
    <div class="mx-auto flex w-full max-w-6xl flex-col gap-4">
        <Cabecalho titulo="Fornecedores" subtitulo="Mantenha os fornecedores atualizados">
            <NuxtLink to="/fornecedores/novo" class="botao botao-primario text-[12px]">
                <Icon name="lucide:plus" class="w-[13px] h-[13px]" />
                Novo Fornecedor
            </NuxtLink>
        </Cabecalho>

        <div v-if="pending" class="text-[13px] text-tx-soft">Carregando fornecedores...</div>
        <div v-else-if="error" class="text-[13px] text-tx-soft">Erro ao carregar fornecedores.</div>

        <div v-else-if="fornecedores" class="tbl-wrap">
            <div class="toolbar">
                <div class="busca">
                    <Icon name="lucide:search" class="w-[13px] h-[13px] text-tx-soft flex-shrink-0" />
                    <input v-model="busca" type="text" placeholder="Buscar fornecedores..." />
                </div>

                <span class="flex-1" />
            </div>

            <table class="w-full border-collapse">
                <thead>
                    <tr>
                        <th class="col-th">Razão Social</th>
                        <th class="col-th">Nome Fantasia</th>
                        <th class="col-th">CNPJ</th>
                        <th class="col-th">Contato</th>
                        <th class="col-th">Prazo Médio</th>
                        <th class="col-th">Status</th>
                        <th class="col-th">Ações</th>
                    </tr>
                </thead>

                <tbody>
                    <tr v-for="f in lista" :key="f.id" class="linha">
                        <td class="col-td font-medium">{{ f.razaoSocial }}</td>
                        <td class="col-td">{{ f.nomeFantasia || "-" }}</td>
                        <td class="col-td text-tx-mid">{{ f.cnpj || "-" }}</td>
                        <td class="col-td text-tx-mid">{{ f.contato || "-" }}</td>
                        <td class="col-td">{{ formatarPrazo(f.prazoMedio || 0) }}</td>
                        <td class="col-td">
                            <Etiqueta :status="f.status" :rotulo="f.status === 'ok' ? 'Ativo' : 'Inativo'" />
                        </td>
                        <td class="col-td">
                            <div class="flex items-center gap-2">
                                <NuxtLink :to="`/fornecedores/${f.id}`" class="botao botao-ghost !py-1 !px-2">
                                    Editar
                                </NuxtLink>
                                <button @click="excluirFornecedor(f.id)" class="botao botao-ghost !py-1 !px-2 text-red">
                                    Excluir
                                </button>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>

            <div class="paginacao">
                <span class="pag-info">{{ lista.length }} fornecedores</span>
            </div>
        </div>
    </div>
</template>
