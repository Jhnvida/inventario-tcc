<script setup lang="ts">
definePageMeta({ titulo: "Dashboard" });

const itensAlertas = [
    { nome: "Cabo HDMI 2.0 2m", sku: "CBL-HDMI-002", estoque: 4, minimo: 20, status: "critico" },
    { nome: "Teclado Mecânico TK200", sku: "TEC-MEC-200", estoque: 7, minimo: 15, status: "alerta" },
    { nome: "Mouse Sem Fio M320", sku: "MOU-WLS-320", estoque: 2, minimo: 10, status: "critico" },
    { nome: 'Monitor 24" Full HD', sku: "MON-FHD-240", estoque: 3, minimo: 8, status: "alerta" },
    { nome: "Headset USB HX100", sku: "HDS-USB-100", estoque: 1, minimo: 12, status: "critico" },
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
                            v-for="item in itensAlertas"
                            :key="item.sku"
                            class="border-b border-line last:border-0 hover:bg-surface2 transition-colors duration-75"
                        >
                            <td class="col-td font-medium">{{ item.nome }}</td>
                            <td class="col-td font-mono text-[11.5px] text-tx-mid">{{ item.sku }}</td>
                            <td class="col-td text-amber font-medium">{{ item.estoque }}</td>
                            <td class="col-td text-tx-mid">{{ item.minimo }}</td>
                            <td class="col-td"><Etiqueta :status="item.status" /></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</template>

<style scoped>
.col-th {
    @apply px-[13px] py-2 text-[10.5px] font-semibold text-tx-soft uppercase tracking-[0.06em] text-left border-b border-line bg-surface2;
}

.col-td {
    @apply px-[13px] py-[9px] text-[13px];
}
</style>
