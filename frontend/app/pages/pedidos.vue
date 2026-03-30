<script setup lang="ts">
import type { Pedido, StatusPedido } from "~/types";
definePageMeta({ titulo: "Pedidos" });

const pedidos: Pedido[] = [
    {
        id: 1,
        numero: "PED-2026-0089",
        fornecedor: "Fornecedor A",
        itens: 4,
        valor: 8430,
        status: "aberto",
        previsao: "2026-03-30",
        data: "2026-03-12T00:00:00",
    },
    {
        id: 2,
        numero: "PED-2026-0088",
        fornecedor: "Fornecedor B",
        itens: 2,
        valor: 3200,
        status: "parcial",
        previsao: "2026-03-25",
        data: "2026-03-10T00:00:00",
    },
    {
        id: 3,
        numero: "PED-2026-0087",
        fornecedor: "Fornecedor C",
        itens: 6,
        valor: 12750,
        status: "concluido",
        previsao: "2026-03-14",
        data: "2026-03-07T00:00:00",
    },
    {
        id: 4,
        numero: "PED-2026-0086",
        fornecedor: "Fornecedor D",
        itens: 3,
        valor: 5600,
        status: "aberto",
        previsao: "2026-04-01",
        data: "2026-03-06T00:00:00",
    },
    {
        id: 5,
        numero: "PED-2026-0085",
        fornecedor: "Fornecedor A",
        itens: 1,
        valor: 980,
        status: "cancelado",
        previsao: "2026-03-20",
        data: "2026-03-04T00:00:00",
    },
];

const rotulos: Record<StatusPedido, string> = {
    rascunho: "Rascunho",
    aberto: "Em andamento",
    parcial: "Enviado",
    concluido: "Entregue",
    cancelado: "Cancelado",
};

const statusEtiqueta: Record<StatusPedido, string> = {
    rascunho: "inativo",
    aberto: "info",
    parcial: "alerta",
    concluido: "ok",
    cancelado: "critico",
};
</script>

<template>
    <div class="tbl-wrap">
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

            <button class="botao botao-primario text-[13px]">
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
</template>
