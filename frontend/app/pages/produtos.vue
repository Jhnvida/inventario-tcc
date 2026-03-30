<script setup lang="ts">
import type { Produto } from "~/types";
definePageMeta({ titulo: "Produtos" });

const produtos: Produto[] = [
    {
        id: 1,
        nome: "Produto A",
        sku: "PRD-001",
        categoria: "Categoria 1",
        local: "Local A",
        estoque: 42,
        minimo: 10,
        preco: 100,
        status: statusEstoque(42, 10),
    },
    {
        id: 2,
        nome: "Produto B",
        sku: "PRD-002",
        categoria: "Categoria 2",
        local: "Local B",
        estoque: 4,
        minimo: 20,
        preco: 200,
        status: statusEstoque(4, 20),
    },
    {
        id: 3,
        nome: "Produto C",
        sku: "PRD-003",
        categoria: "Categoria 1",
        local: "Local C",
        estoque: 7,
        minimo: 15,
        preco: 300,
        status: statusEstoque(7, 15),
    },
    {
        id: 4,
        nome: "Produto D",
        sku: "PRD-004",
        categoria: "Categoria 1",
        local: "Local A",
        estoque: 2,
        minimo: 10,
        preco: 400,
        status: statusEstoque(2, 10),
    },
    {
        id: 5,
        nome: "Produto E",
        sku: "PRD-005",
        categoria: "Categoria 3",
        local: "Local B",
        estoque: 3,
        minimo: 8,
        preco: 500,
        status: statusEstoque(3, 8),
    },
    {
        id: 6,
        nome: "Produto F",
        sku: "PRD-006",
        categoria: "Categoria 1",
        local: "Local C",
        estoque: 1,
        minimo: 12,
        preco: 600,
        status: statusEstoque(1, 12),
    },
    {
        id: 7,
        nome: "Produto G",
        sku: "PRD-007",
        categoria: "Categoria 2",
        local: "Local B",
        estoque: 18,
        minimo: 5,
        preco: 700,
        status: statusEstoque(18, 5),
    },
    {
        id: 8,
        nome: "Produto H",
        sku: "PRD-008",
        categoria: "Categoria 4",
        local: "Local A",
        estoque: 55,
        minimo: 10,
        preco: 800,
        status: statusEstoque(55, 10),
    },
];

const categorias = ["Categoria 1", "Categoria 2", "Categoria 3", "Categoria 4"];
const locais = ["Local A", "Local B", "Local C"];
</script>

<template>
    <div class="tbl-wrap">
        <div class="toolbar">
            <div class="busca">
                <Icon name="lucide:search" class="w-[13px] h-[13px] text-tx-soft flex-shrink-0" />
                <input type="text" placeholder="Buscar produtos..." />
            </div>

            <select class="filtro-sel">
                <option value="">Todas as categorias</option>
                <option v-for="cat in categorias" :key="cat" :value="cat">{{ cat }}</option>
            </select>

            <select class="filtro-sel">
                <option value="">Todos os locais</option>
                <option v-for="loc in locais" :key="loc" :value="loc">{{ loc }}</option>
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
                    <td class="col-td"><Etiqueta :status="p.status" /></td>
                </tr>
            </tbody>
        </table>

        <div class="paginacao">
            <span class="pag-info">{{ produtos.length }} produtos</span>
        </div>
    </div>
</template>
