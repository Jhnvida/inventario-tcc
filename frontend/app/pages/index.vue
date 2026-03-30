<script setup lang="ts">
import type { Produto, Movimentacao } from "~/types";
definePageMeta({ titulo: "Dashboard" });

const itens: Pick<Produto, "nome" | "sku" | "estoque" | "minimo">[] = [
    { nome: "Produto B", sku: "PRD-002", estoque: 4, minimo: 20 },
    { nome: "Produto C", sku: "PRD-003", estoque: 7, minimo: 15 },
    { nome: "Produto D", sku: "PRD-004", estoque: 2, minimo: 10 },
    { nome: "Produto E", sku: "PRD-005", estoque: 3, minimo: 8 },
    { nome: "Produto F", sku: "PRD-006", estoque: 1, minimo: 12 },
];

const movimentacoes: Movimentacao[] = [
    {
        id: 1,
        tipo: "entrada",
        produto: "Cabo HDMI 2.0",
        sku: "PRD-011",
        quantidade: 50,
        responsavel: "Carlos M.",
        data: "2026-03-23T09:14:00",
    },
    {
        id: 2,
        tipo: "saida",
        produto: "Teclado TK200",
        sku: "PRD-003",
        quantidade: 12,
        responsavel: "Ana S.",
        data: "2026-03-23T08:30:00",
    },
    {
        id: 3,
        tipo: "saida",
        produto: 'Monitor 24" Full HD',
        sku: "PRD-007",
        quantidade: 3,
        responsavel: "Carlos M.",
        data: "2026-03-23T07:55:00",
    },
    {
        id: 4,
        tipo: "entrada",
        produto: "Headset HX100",
        sku: "PRD-009",
        quantidade: 20,
        responsavel: "Rafael T.",
        data: "2026-03-22T17:40:00",
    },
    {
        id: 5,
        tipo: "saida",
        produto: "Mouse M320",
        sku: "PRD-005",
        quantidade: 8,
        responsavel: "Ana S.",
        data: "2026-03-22T15:22:00",
    },
    {
        id: 6,
        tipo: "entrada",
        produto: "Webcam WC100 HD",
        sku: "PRD-014",
        quantidade: 15,
        responsavel: "Rafael T.",
        data: "2026-03-22T11:05:00",
    },
];
</script>

<template>
    <div class="flex flex-col gap-6">
        <div class="grid grid-cols-4 gap-px bg-line border border-line">
            <Cartao rotulo="Valor Total" valor="R$487k" icone="lucide:circle-dollar-sign" />
            <Cartao rotulo="Produtos" valor="1.248" icone="lucide:package" />
            <Cartao rotulo="Em Alerta" valor="23" icone="lucide:triangle-alert" />
            <Cartao rotulo="Pedidos Abertos" valor="8" icone="lucide:clipboard-check" />
        </div>

        <div>
            <Cabecalho titulo="Estoque Crítico" subtitulo="Produtos abaixo do mínimo">
                <NuxtLink to="/produtos" class="botao botao-ghost text-[12px]">Ver todos</NuxtLink>
            </Cabecalho>

            <div class="tbl-wrap">
                <table class="w-full border-collapse">
                    <thead>
                        <tr>
                            <th class="col-th">Produto</th>
                            <th class="col-th">SKU</th>
                            <th class="col-th">Estoque</th>
                            <th class="col-th">Mínimo</th>
                            <th class="col-th">Status</th>
                        </tr>
                    </thead>

                    <tbody>
                        <tr v-for="i in itens" :key="i.sku" class="linha">
                            <td class="col-td font-medium">{{ i.nome }}</td>
                            <td class="col-td text-tx-mid">{{ i.sku }}</td>
                            <td class="col-td font-medium">{{ i.estoque }}</td>
                            <td class="col-td text-tx-mid">{{ i.minimo }}</td>
                            <td class="col-td"><Etiqueta :status="statusEstoque(i.estoque, i.minimo)" /></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <div>
            <Cabecalho titulo="Movimentações Recentes" subtitulo="Últimas entradas e saídas de estoque">
                <NuxtLink to="/movimentacoes" class="botao botao-ghost text-[12px]">Ver todos</NuxtLink>
            </Cabecalho>

            <div class="tbl-wrap">
                <table class="w-full border-collapse">
                    <thead>
                        <tr>
                            <th class="col-th">Tipo</th>
                            <th class="col-th">Produto</th>
                            <th class="col-th">SKU</th>
                            <th class="col-th">Qtd</th>
                            <th class="col-th">Responsável</th>
                            <th class="col-th">Criado em</th>
                        </tr>
                    </thead>

                    <tbody>
                        <tr v-for="m in movimentacoes" :key="m.id" class="linha">
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
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</template>
