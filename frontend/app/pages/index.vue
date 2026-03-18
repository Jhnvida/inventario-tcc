<script setup lang="ts">
definePageMeta({ titulo: "Dashboard" });

const itens = [
    { nome: "Produto B", sku: "PRD-002", estoque: 4, minimo: 20 },
    { nome: "Produto C", sku: "PRD-003", estoque: 7, minimo: 15 },
    { nome: "Produto D", sku: "PRD-004", estoque: 2, minimo: 10 },
    { nome: "Produto E", sku: "PRD-005", estoque: 3, minimo: 8 },
    { nome: "Produto F", sku: "PRD-006", estoque: 1, minimo: 12 },
];
</script>

<template>
    <div class="flex flex-col gap-6">
        <div class="grid grid-cols-4 gap-px bg-line border border-line">
            <Cartao rotulo="Valor Total" valor="R$487k" icone="lucide:circle-dollar-sign" />
            <Cartao rotulo="Produtos" valor="1.248" icone="lucide:package" />
            <Cartao rotulo="Em Alerta" valor="23" icone="lucide:triangle-alert" cor-valor="text-amber" />
            <Cartao rotulo="Pedidos Abertos" valor="8" icone="lucide:clipboard-check" />
        </div>

        <div>
            <Cabecalho titulo="Estoque Crítico" subtitulo="Produtos abaixo do mínimo">
                <NuxtLink to="/produtos" class="botao botao-ghost text-[12px]">Ver todos</NuxtLink>
            </Cabecalho>

            <div class="bg-surface border border-line">
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
                        <tr
                            v-for="item in itens"
                            :key="item.sku"
                            class="border-b border-line last:border-0 hover:bg-surface2 transition-colors duration-75"
                        >
                            <td class="col-td font-medium">{{ item.nome }}</td>
                            <td class="col-td font-mono text-[11.5px] text-tx-mid">{{ item.sku }}</td>
                            <td class="col-td text-amber font-medium">{{ item.estoque }}</td>
                            <td class="col-td text-tx-mid">{{ item.minimo }}</td>
                            <td class="col-td"><Etiqueta :status="statusEstoque(item.estoque, item.minimo)" /></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</template>
