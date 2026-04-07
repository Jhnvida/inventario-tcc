<script setup lang="ts">
import type { Movimentacao } from "~/types";
definePageMeta({ titulo: "Movimentações" });

const { data: movimentacoes, pending, error } = useLazyFetch<Movimentacao[]>("/api/movimentacoes");
</script>

<template>
    <div class="flex flex-col gap-4">
        <div v-if="pending" class="text-tx-soft text-[13px] px-4">Carregando movimentações...</div>
        <div v-else-if="error" class="text-tx-soft text-[13px] px-4">Erro ao carregar movimentações.</div>

        <div v-else-if="movimentacoes" class="tbl-wrap">
            <div class="toolbar">
                <div class="busca">
                    <Icon name="lucide:search" class="w-[13px] h-[13px] text-tx-soft flex-shrink-0" />
                    <input type="text" placeholder="Buscar produto, SKU..." />
                </div>

                <select class="filtro-sel">
                    <option value="">Todos os tipos</option>
                    <option value="entrada">Entrada</option>
                    <option value="saida">Saída</option>
                </select>

                <span class="flex-1" />

                <button class="botao botao-primario text-[13px]">
                    <Icon name="lucide:plus" class="w-[13px] h-[13px]" />
                    Nova Movimentação
                </button>
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

            <div class="paginacao">
                <span class="pag-info">{{ movimentacoes.length }} movimentações</span>
            </div>
        </div>
    </div>
</template>
