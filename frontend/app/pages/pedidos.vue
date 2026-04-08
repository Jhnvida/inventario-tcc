<script setup lang="ts">
import type { Pedido, StatusPedido, StatusEstoque } from "~/types";
definePageMeta({ titulo: "Pedidos" });

const { data: pedidos, pending, error } = useLazyFetch<Pedido[]>("/api/pedidos");

const rotulos: Record<StatusPedido, string> = {
    rascunho: "Rascunho",
    aberto: "Em andamento",
    parcial: "Enviado",
    concluido: "Entregue",
    cancelado: "Cancelado",
};

const statusEtiqueta: Record<StatusPedido, StatusEstoque> = {
    rascunho: "inativo",
    aberto: "info",
    parcial: "alerta",
    concluido: "ok",
    cancelado: "critico",
};

const exibindoForm = ref(false);
</script>

<template>
    <div class="flex flex-col gap-4">
        <div v-if="pending" class="text-tx-soft text-[13px] px-4">Carregando pedidos...</div>
        <div v-else-if="error" class="text-tx-soft text-[13px] px-4">Erro ao carregar pedidos.</div>

        <div v-else-if="pedidos" class="tbl-wrap">
            <div class="toolbar">
                <div class="busca">
                    <Icon name="lucide:search" class="w-[13px] h-[13px] text-tx-soft flex-shrink-0" />
                    <input type="text" placeholder="Buscar pedidos..." />
                </div>

                <select class="filtro-sel">
                    <option value="">Todos os status</option>
                    <option value="aberto">Em andamento</option>
                    <option value="parcial">Enviado</option>
                    <option value="concluido">Entregue</option>
                    <option value="cancelado">Cancelado</option>
                </select>

                <span class="flex-1" />

                <button @click="exibindoForm = true" class="botao botao-primario text-[13px]">
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
                    <tr v-for="p in pedidos" :key="p.id" class="linha">
                        <td class="col-td font-medium">{{ p.numero }}</td>
                        <td class="col-td">{{ p.fornecedor }}</td>
                        <td class="col-td">
                            <Etiqueta :status="statusEtiqueta[p.status]" :rotulo="rotulos[p.status]" />
                        </td>
                        <td class="col-td text-tx-mid">{{ p.itens }}</td>
                        <td class="col-td font-medium">{{ formatarMoeda(p.valor) }}</td>
                        <td class="col-td text-tx-mid">{{ formatarData(p.previsao) }}</td>
                        <td class="col-td text-tx-soft">{{ formatarData(p.data) }}</td>
                    </tr>
                </tbody>
            </table>

            <div class="paginacao">
                <span class="pag-info">{{ pedidos.length }} pedidos</span>
            </div>
        </div>

        <Painel v-model:aberto="exibindoForm" titulo="Novo Pedido">
            <FormPedido @cancelar="exibindoForm = false" />
        </Painel>
    </div>
</template>
