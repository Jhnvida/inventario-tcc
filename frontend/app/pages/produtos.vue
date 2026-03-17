<script setup lang="ts">
definePageMeta({ titulo: "Produtos" });

interface Produto {
    id: number;
    nome: string;
    sku: string;
    categoria: string;
    local: string;
    estoque: number;
    minimo: number;
    preco: string;
}

const produtos: Produto[] = [
    {
        id: 1,
        nome: 'Monitor 27" 4K',
        sku: "MON-4K-270",
        categoria: "Monitores",
        local: "Galpão A",
        estoque: 42,
        minimo: 10,
        preco: "R$1.899,00",
    },
    {
        id: 2,
        nome: "Cabo HDMI 2.0 2m",
        sku: "CBL-HDMI-002",
        categoria: "Cabos",
        local: "Depósito 1",
        estoque: 4,
        minimo: 20,
        preco: "R$49,90",
    },
    {
        id: 3,
        nome: "Teclado Mecânico TK200",
        sku: "TEC-MEC-200",
        categoria: "Periféricos",
        local: "Galpão B",
        estoque: 7,
        minimo: 15,
        preco: "R$389,00",
    },
    {
        id: 4,
        nome: "Mouse Sem Fio M320",
        sku: "MOU-WLS-320",
        categoria: "Periféricos",
        local: "Galpão A",
        estoque: 2,
        minimo: 10,
        preco: "R$159,00",
    },
    {
        id: 5,
        nome: "Headset USB HX100",
        sku: "HDS-USB-100",
        categoria: "Áudio",
        local: "Depósito 1",
        estoque: 1,
        minimo: 12,
        preco: "R$219,90",
    },
    {
        id: 6,
        nome: "Webcam Full HD WC200",
        sku: "WEB-FHD-200",
        categoria: "Periféricos",
        local: "Galpão B",
        estoque: 31,
        minimo: 8,
        preco: "R$299,00",
    },
    {
        id: 7,
        nome: "Hub USB-C 7 em 1",
        sku: "HUB-USC-701",
        categoria: "Cabos",
        local: "Depósito 1",
        estoque: 18,
        minimo: 5,
        preco: "R$189,00",
    },
    {
        id: 8,
        nome: "Suporte para Notebook",
        sku: "SUP-NBK-001",
        categoria: "Acessórios",
        local: "Galpão A",
        estoque: 55,
        minimo: 10,
        preco: "R$129,90",
    },
];

const categorias = ["Periféricos", "Monitores", "Cabos", "Áudio", "Acessórios"];
const locais = ["Galpão A", "Galpão B", "Depósito 1"];
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
                    <td class="col-td col-mono">{{ p.sku }}</td>
                    <td class="col-td">{{ p.categoria }}</td>
                    <td class="col-td text-tx-mid">{{ p.local }}</td>
                    <td class="col-td">
                        <div class="barra-estoque">
                            <span :class="{ 'estoque-baixo': statusEstoque(p.estoque, p.minimo) !== 'ok' }">{{ p.estoque }}</span>
                            <div class="barra-fundo">
                                <div
                                    class="barra-fill"
                                    :style="{
                                        width: percentualEstoque(p.estoque, p.minimo) + '%',
                                        background: corBarra(statusEstoque(p.estoque, p.minimo)),
                                    }"
                                />
                            </div>
                        </div>
                    </td>
                    <td class="col-td text-tx-mid">{{ p.minimo }}</td>
                    <td class="col-td col-mono">{{ p.preco }}</td>
                    <td class="col-td"><Etiqueta :status="statusEstoque(p.estoque, p.minimo)" /></td>
                </tr>
            </tbody>
        </table>

        <div class="paginacao">
            <span class="pag-info">Exibindo 1–{{ produtos.length }} de 1.248 produtos</span>
            <button class="pag-btn ativo">1</button>
            <button class="pag-btn">2</button>
            <button class="pag-btn">3</button>
            <button class="pag-btn">…</button>
            <button class="pag-btn">156</button>
        </div>
    </div>
</template>

<style scoped>
.tbl-wrap {
    @apply bg-surface border border-line;
}

.toolbar {
    @apply flex items-center gap-2 px-[14px] py-[10px] border-b border-line;
}

.busca {
    @apply flex items-center gap-[7px] border border-line bg-bg px-[11px] py-[5px] w-[185px];
}

.busca input {
    @apply border-none bg-transparent outline-none text-[13px] text-tx w-full;
    font-family: inherit;
}

.busca input::placeholder {
    @apply text-tx-soft;
}

.filtro-sel {
    @apply bg-bg border border-line px-[9px] py-[5px] text-[13px] text-tx-mid outline-none cursor-pointer;
    font-family: inherit;
}

.col-th {
    @apply px-[13px] py-2 text-[10.5px] font-semibold text-tx-soft uppercase tracking-[0.06em] text-left border-b border-line bg-surface2;
}

.col-td {
    @apply px-[13px] py-[9px] text-[13px] align-middle;
}

.col-mono {
    @apply font-mono text-[11.5px] text-tx-mid;
}

.linha {
    @apply border-b border-line last:border-0 transition-colors duration-75;
}

.linha:hover {
    background: #fafafa;
}

.linha:nth-child(even) {
    background: #fbfbfb;
}

.linha:nth-child(even):hover {
    background: #f5f5f5;
}

.barra-estoque {
    @apply flex items-center gap-[7px];
}

.estoque-baixo {
    @apply text-amber font-medium;
}

.barra-fundo {
    width: 44px;
    height: 2px;
    background: #e8e8e8;
    flex-shrink: 0;
}

.barra-fill {
    height: 100%;
}

.paginacao {
    @apply flex items-center gap-1 px-[13px] py-[8px] border-t border-line;
}

.pag-info {
    @apply text-[11.5px] text-tx-soft flex-1;
}

.pag-btn {
    @apply w-[26px] h-[26px] border border-line bg-surface text-[12px] cursor-pointer flex items-center justify-center text-tx-mid;
    font-family: inherit;
}

.pag-btn:hover:not(.ativo) {
    @apply bg-bg;
}

.pag-btn.ativo {
    @apply bg-blue text-white border-blue;
}
</style>
