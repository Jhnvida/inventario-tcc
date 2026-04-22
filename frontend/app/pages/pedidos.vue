<script setup lang="ts">
import type { Pedido, StatusPedido, StatusEstoque } from "~/types";
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

const abrir = ref(false);
const salvando = ref(false);
const erro = ref("");
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
        await refresh();
        abrir.value = false;
    } catch {
        erro.value = "Nao foi possivel salvar o pedido.";
    } finally {
        salvando.value = false;
    }
}
</script>

<template>
    <div class="flex flex-col gap-4">
        <div v-if="pending" class="text-tx-soft text-[13px] px-4">Carregando pedidos...</div>
        <div v-else-if="error" class="text-tx-soft text-[13px] px-4">Erro ao carregar pedidos.</div>

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

                <button @click="abrir = true" class="botao botao-primario text-[13px]">
                    <Icon name="lucide:plus" class="w-[13px] h-[13px]" />
                    Novo Pedido
                </button>
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
                    </tr>
                </tbody>
            </table>

            <div class="paginacao">
                <span class="pag-info">{{ lista.length }} pedidos</span>
            </div>
        </div>

        <Painel v-model:aberto="abrir" titulo="Novo Pedido">
            <FormPedido :erro="erro" :salvando="salvando" @cancelar="abrir = false" @salvar="salvarPedido" />
        </Painel>
    </div>
</template>
