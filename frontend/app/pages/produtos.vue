<script setup lang="ts">
import type { Produto } from "~/types";
definePageMeta({ titulo: "Produtos" });

const { data: produtos, pending, error } = useFetch<Produto[]>("/api/produtos", { lazy: true });

const categorias = ["Hardware", "Periféricos", "Monitores", "Conectividade"];
const locais = ["Almoxarifado A", "Almoxarifado B", "TI"];
</script>

<template>
    <div class="flex flex-col gap-4">
        <div v-if="pending" class="text-tx-soft text-[13px] px-4">Carregando produtos...</div>
        <div v-else-if="error" class="text-tx-soft text-[13px] px-4">Erro ao carregar produtos.</div>

        <div v-else-if="produtos" class="tbl-wrap">
            <div class="toolbar">
                <div class="busca">
                    <Icon name="lucide:search" class="w-[13px] h-[13px] text-tx-soft flex-shrink-0" />
                    <input type="text" placeholder="Buscar produtos..." />
                </div>

                <select class="filtro-sel">
                    <option value="">Todas as categorias</option>
                    <option v-for="cat in categorias" :key="cat" :value="cat">
                        {{ cat }}
                    </option>
                </select>

                <select class="filtro-sel">
                    <option value="">Todos os locais</option>
                    <option v-for="loc in locais" :key="loc" :value="loc">
                        {{ loc }}
                    </option>
                </select>

                <span class="flex-1" />

                <button class="botao botao-primario text-[13px]">
                    <Icon name="lucide:plus" class="w-[13px] h-[13px]" />
                    Novo Produto
                </button>
            </div>

            <table class="w-full border-collapse">
                <thead>
                    <tr>
                        <th class="col-th">Produto</th>
                        <th class="col-th">SKU</th>
                        <th class="col-th">Categoria</th>
                        <th class="col-th">Local</th>
                        <th class="col-th">Estoque</th>
                        <th class="col-th">Mínimo</th>
                        <th class="col-th">Preço</th>
                        <th class="col-th">Status</th>
                    </tr>
                </thead>

                <tbody>
                    <tr v-for="p in produtos" :key="p.id" class="linha">
                        <td class="col-td font-medium">{{ p.nome }}</td>
                        <td class="col-td text-tx-mid">{{ p.sku }}</td>
                        <td class="col-td">{{ p.categoria }}</td>
                        <td class="col-td text-tx-mid">{{ p.local }}</td>
                        <td class="col-td">{{ p.estoque }}</td>
                        <td class="col-td text-tx-mid">{{ p.minimo }}</td>
                        <td class="col-td">{{ formatarMoeda(p.preco) }}</td>
                        <td class="col-td">
                            <Etiqueta :status="statusEstoque(p.estoque, p.minimo)" />
                        </td>
                    </tr>
                </tbody>
            </table>

            <div class="paginacao">
                <span class="pag-info">{{ produtos.length }} produtos</span>
            </div>
        </div>
    </div>
</template>
