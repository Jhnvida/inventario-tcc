<script setup lang="ts">
import type { Movimentacao } from "~/types";

definePageMeta({ titulo: "Movimentações" });

const { data: movs, pending, error, refresh } = useLazyFetch<Movimentacao[]>("/api/movimentacoes");
const busca = ref("");
const tipo = ref("");

const lista = computed(() => {
    const termo = busca.value.trim().toLowerCase();

    return (movs.value || []).filter((m) => {
        const correspondeBusca =
            !termo ||
            m.produto.toLowerCase().includes(termo) ||
            m.sku.toLowerCase().includes(termo) ||
            (m.responsavel || "").toLowerCase().includes(termo);
        const correspondeTipo = !tipo.value || m.tipo === tipo.value;
        return correspondeBusca && correspondeTipo;
    });
});

async function excluirMovimentacao(id: number) {
    if (!confirm("Deseja remover esta movimentacao?")) return;
    try {
        await $fetch(`/api/movimentacoes/${id}`, { method: "DELETE" });
        await refresh();
    } catch {
        alert("Nao foi possivel remover a movimentacao.");
    }
}
</script>

<template>
    <div class="mx-auto flex w-full max-w-6xl flex-col gap-4">
        <Cabecalho titulo="Movimentações" subtitulo="Registre e audite entradas e saídas de estoque">
            <NuxtLink to="/movimentacoes/nova" class="botao botao-primario text-[12px]">
                <Icon name="lucide:plus" class="w-[13px] h-[13px]" />
                Nova Movimentação
            </NuxtLink>
        </Cabecalho>

        <div v-if="pending" class="text-[13px] text-tx-soft">Carregando movimentações...</div>
        <div v-else-if="error" class="text-[13px] text-tx-soft">Erro ao carregar movimentações.</div>

        <div v-else-if="movs" class="tbl-wrap">
            <div class="toolbar">
                <div class="busca">
                    <Icon name="lucide:search" class="w-[13px] h-[13px] text-tx-soft flex-shrink-0" />
                    <input v-model="busca" type="text" placeholder="Buscar produto, SKU..." />
                </div>

                <select v-model="tipo" class="filtro-sel">
                    <option value="">Todos os tipos</option>
                    <option value="entrada">Entrada</option>
                    <option value="saida">Saída</option>
                </select>

                <span class="flex-1" />
            </div>

            <table class="w-full border-collapse">
                <thead>
                    <tr>
                        <th class="col-th">Tipo</th>
                        <th class="col-th">Produto</th>
                        <th class="col-th">SKU</th>
                        <th class="col-th">Qtd</th>
                        <th class="col-th">Responsável</th>
                        <th class="col-th">Criado em</th>
                        <th class="col-th">Ações</th>
                    </tr>
                </thead>

                <tbody>
                    <tr v-for="m in lista" :key="m.id" class="linha">
                        <td class="col-td">
                            <Etiqueta
                                :status="m.tipo === 'entrada' ? 'ok' : 'info'"
                                :rotulo="m.tipo === 'entrada' ? 'Entrada' : 'Saída'"
                            />
                        </td>
                        <td class="col-td font-medium">{{ m.produto }}</td>
                        <td class="col-td text-tx-mid">{{ m.sku }}</td>
                        <td class="col-td font-medium">{{ m.quantidade }}</td>
                        <td class="col-td text-tx-mid">{{ m.responsavel }}</td>
                        <td class="col-td text-tx-soft">{{ formatarDataHora(m.data) }}</td>
                        <td class="col-td">
                            <div class="flex items-center gap-2">
                                <NuxtLink :to="`/movimentacoes/${m.id}`" class="botao botao-ghost !py-1 !px-2"
                                    >Editar</NuxtLink
                                >
                                <button
                                    @click="excluirMovimentacao(m.id)"
                                    class="botao botao-ghost !py-1 !px-2 text-red"
                                >
                                    Excluir
                                </button>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>

            <div class="paginacao">
                <span class="pag-info">{{ lista.length }} movimentações</span>
            </div>
        </div>
    </div>
</template>
