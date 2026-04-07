<script setup lang="ts">
import type { ResumoDashboard } from "~/types";
definePageMeta({ titulo: "Dashboard" });

const { data, pending, error } = useFetch<ResumoDashboard>("/api/dashboard", {
    lazy: true,
});
</script>

<template>
    <div class="flex flex-col gap-6">
        <div v-if="pending" class="text-tx-soft text-[13px]">Carregando...</div>
        <div v-else-if="error" class="text-tx-soft text-[13px]">Erro ao carregar dashboard.</div>

        <template v-else-if="data">
            <div class="grid grid-cols-4 gap-px bg-line border border-line">
                <Cartao
                    rotulo="Valor Total"
                    :valor="formatarMoeda(Number(data.valor_total))"
                    icone="lucide:circle-dollar-sign"
                />
                <Cartao rotulo="Produtos" :valor="String(data.total_produtos)" icone="lucide:package" />
                <Cartao rotulo="Em Alerta" :valor="String(data.em_alerta)" icone="lucide:triangle-alert" />
                <Cartao rotulo="Pedidos Abertos" :valor="String(data.pedidos_abertos)" icone="lucide:clipboard-check" />
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
                            <tr v-for="i in data.estoque_critico" :key="i.sku" class="linha">
                                <td class="col-td font-medium">{{ i.nome }}</td>
                                <td class="col-td text-tx-mid">{{ i.sku }}</td>
                                <td class="col-td font-medium">{{ i.estoque }}</td>
                                <td class="col-td text-tx-mid">{{ i.minimo }}</td>
                                <td class="col-td">
                                    <Etiqueta :status="statusEstoque(i.estoque, i.minimo)" />
                                </td>
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
                            <tr v-for="m in data.movimentacoes_recentes" :key="m.id" class="linha">
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
                                <td class="col-td text-tx-soft">
                                    {{ formatarDataHora(m.data) }}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </template>
    </div>
</template>
