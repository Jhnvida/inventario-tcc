<script setup lang="ts">
import type { Pedido, StatusPedido } from "~/types";
definePageMeta({ titulo: "Pedidos" });

const pedidos: Pedido[] = [
    {
        id: 1,
        numero: "PED-2026-0089",
        fornecedor: "Fornecedor A",
        itens: 4,
        valor: "R$8.430,00",
        status: "aberto",
        previsao: "30/03/2026",
        data: "12/03/2026",
    },
    {
        id: 2,
        numero: "PED-2026-0088",
        fornecedor: "Fornecedor B",
        itens: 2,
        valor: "R$3.200,00",
        status: "parcial",
        previsao: "25/03/2026",
        data: "10/03/2026",
    },
    {
        id: 3,
        numero: "PED-2026-0087",
        fornecedor: "Fornecedor C",
        itens: 6,
        valor: "R$12.750,00",
        status: "concluido",
        previsao: "14/03/2026",
        data: "07/03/2026",
    },
    {
        id: 4,
        numero: "PED-2026-0086",
        fornecedor: "Fornecedor D",
        itens: 3,
        valor: "R$5.600,00",
        status: "aberto",
        previsao: "01/04/2026",
        data: "06/03/2026",
    },
    {
        id: 5,
        numero: "PED-2026-0085",
        fornecedor: "Fornecedor A",
        itens: 1,
        valor: "R$980,00",
        status: "cancelado",
        previsao: "20/03/2026",
        data: "04/03/2026",
    },
];

const rotulos: Record<StatusPedido, string> = {
    aberto: "Em andamento",
    parcial: "Enviado",
    concluido: "Entregue",
    cancelado: "Cancelado",
};

const statusEtiqueta: Record<StatusPedido, string> = {
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
                    <td class="col-td text-tx-mid">{{ p.previsao }}</td>
                    <td class="col-td text-tx-soft">{{ p.data }}</td>
                </tr>
            </tbody>
        </table>

        <div class="paginacao">
            <span class="pag-info">{{ pedidos.length }} pedidos</span>
        </div>
    </div>
</template>
