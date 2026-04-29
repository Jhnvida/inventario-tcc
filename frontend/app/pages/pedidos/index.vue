<script setup lang="ts">
import type { Pedido, StatusEstoque, StatusPedido } from "~/types";

definePageMeta({ titulo: "Pedidos" });

const { data: pedidos, pending, error, refresh } = useLazyFetch<Pedido[]>("/api/pedidos");

const rotulos: Record<StatusPedido, string> = {
    rascunho: "Rascunho",
    aberto: "Em andamento",
    parcial: "Enviado",
    concluido: "Entregue",
    cancelado: "Cancelado",
};

const statusTag: Record<StatusPedido, StatusEstoque> = {
    rascunho: "inativo",
    aberto: "info",
    parcial: "alerta",
    concluido: "ok",
    cancelado: "critico",
};

const busca = ref("");
const status = ref("");

const lista = computed(() => {
    const termo = busca.value.trim().toLowerCase();
    return (pedidos.value || []).filter((p) => {
        const correspondeBusca =
            !termo || p.numero.toLowerCase().includes(termo) || p.fornecedor.toLowerCase().includes(termo);
        const correspondeStatus = !status.value || p.status === status.value;
        return correspondeBusca && correspondeStatus;
    });
});

async function excluirPedido(id: number) {
    if (!confirm("Deseja remover este pedido?")) return;
    try {
        await $fetch(`/api/pedidos/${id}`, { method: "DELETE" });
        await refresh();
    } catch {
        alert("Nao foi possivel remover o pedido.");
    }
}
</script>

<template>
    <div class="mx-auto flex w-full max-w-6xl flex-col gap-4">
        <Cabecalho titulo="Pedidos" subtitulo="Acompanhe e gerencie pedidos de compra">
            <NuxtLink to="/pedidos/novo" class="botao botao-primario text-[12px]">
                <Icon name="lucide:plus" class="w-[13px] h-[13px]" />
                Novo Pedido
            </NuxtLink>
        </Cabecalho>

        <div v-if="pending" class="text-[13px] text-tx-soft">Carregando pedidos...</div>
        <div v-else-if="error" class="text-[13px] text-tx-soft">Erro ao carregar pedidos.</div>

        <div v-else-if="pedidos" class="tbl-wrap">
            <div class="toolbar">
                <div class="busca">
                    <Icon name="lucide:search" class="w-[13px] h-[13px] text-tx-soft flex-shrink-0" />
                    <input v-model="busca" type="text" placeholder="Buscar pedidos..." />
                </div>

                <select v-model="status" class="filtro-sel">
                    <option value="">Todos os status</option>
                    <option value="aberto">Em andamento</option>
                    <option value="parcial">Enviado</option>
                    <option value="concluido">Entregue</option>
                    <option value="cancelado">Cancelado</option>
                </select>

                <span class="flex-1" />
            </div>

            <table class="w-full border-collapse">
                <thead>
                    <tr>
                        <th class="col-th">Nº Pedido</th>
                        <th class="col-th">Fornecedor</th>
                        <th class="col-th">Status</th>
                        <th class="col-th">Itens</th>
                        <th class="col-th">Valor</th>
                        <th class="col-th">Previsão</th>
                        <th class="col-th">Criado em</th>
                        <th class="col-th">Ações</th>
                    </tr>
                </thead>

                <tbody>
                    <tr v-for="p in lista" :key="p.id" class="linha">
                        <td class="col-td font-medium">{{ p.numero }}</td>
                        <td class="col-td">{{ p.fornecedor }}</td>
                        <td class="col-td">
                            <Etiqueta :status="statusTag[p.status]" :rotulo="rotulos[p.status]" />
                        </td>
                        <td class="col-td text-tx-mid">{{ p.itens }}</td>
                        <td class="col-td font-medium">{{ formatarMoeda(p.valor) }}</td>
                        <td class="col-td text-tx-mid">{{ formatarData(p.previsao) }}</td>
                        <td class="col-td text-tx-soft">{{ formatarData(p.data) }}</td>
                        <td class="col-td">
                            <div class="flex items-center gap-2">
                                <NuxtLink :to="`/pedidos/${p.id}`" class="botao botao-ghost !py-1 !px-2"
                                    >Editar</NuxtLink
                                >
                                <button @click="excluirPedido(p.id)" class="botao botao-ghost !py-1 !px-2 text-red">
                                    Excluir
                                </button>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>

            <div class="paginacao">
                <span class="pag-info">{{ lista.length }} pedidos</span>
            </div>
        </div>
    </div>
</template>
