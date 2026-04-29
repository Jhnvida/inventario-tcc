<script setup lang="ts">
import type { Produto } from "~/types";

definePageMeta({ titulo: "Produtos" });

const { data: produtos, pending, error, refresh } = useFetch<Produto[]>("/api/produtos", { lazy: true });

const busca = ref("");
const cat = ref("");
const local = ref("");

const categorias = computed(() => {
    const itens = (produtos.value || [])
        .map((p) => p.categoria)
        .filter((categoria): categoria is string => Boolean(categoria))
        .sort((a, b) => a.localeCompare(b));
    return [...new Set(itens)];
});

const locais = computed(() => {
    const itens = (produtos.value || [])
        .map((p) => p.local)
        .filter((item): item is string => Boolean(item))
        .sort((a, b) => a.localeCompare(b));
    return [...new Set(itens)];
});

const lista = computed(() => {
    const termo = busca.value.trim().toLowerCase();
    return (produtos.value || []).filter((produto) => {
        const correspondeBusca =
            !termo ||
            produto.nome.toLowerCase().includes(termo) ||
            produto.sku.toLowerCase().includes(termo) ||
            (produto.categoria || "").toLowerCase().includes(termo);
        const correspondeCategoria = !cat.value || produto.categoria === cat.value;
        const correspondeLocal = !local.value || produto.local === local.value;
        return correspondeBusca && correspondeCategoria && correspondeLocal;
    });
});

async function excluirProduto(id: number) {
    if (!confirm("Deseja remover este produto?")) return;
    try {
        await $fetch(`/api/produtos/${id}`, { method: "DELETE" });
        await refresh();
    } catch {
        alert("Nao foi possivel remover o produto.");
    }
}
</script>

<template>
    <div class="mx-auto flex w-full max-w-6xl flex-col gap-4">
        <Cabecalho titulo="Produtos" subtitulo="Gerencie seu catalogo de produtos">
            <NuxtLink to="/produtos/novo" class="botao botao-primario text-[12px]">
                <Icon name="lucide:plus" class="w-[13px] h-[13px]" />
                Novo Produto
            </NuxtLink>
        </Cabecalho>

        <div v-if="pending" class="text-[13px] text-tx-soft">Carregando produtos...</div>
        <div v-else-if="error" class="text-[13px] text-tx-soft">Erro ao carregar produtos.</div>

        <div v-else-if="produtos" class="tbl-wrap">
            <div class="toolbar">
                <div class="busca">
                    <Icon name="lucide:search" class="w-[13px] h-[13px] text-tx-soft flex-shrink-0" />
                    <input v-model="busca" type="text" placeholder="Buscar produtos..." />
                </div>

                <select v-model="cat" class="filtro-sel">
                    <option value="">Todas as categorias</option>
                    <option v-for="catItem in categorias" :key="catItem" :value="catItem">
                        {{ catItem }}
                    </option>
                </select>

                <select v-model="local" class="filtro-sel">
                    <option value="">Todos os locais</option>
                    <option v-for="loc in locais" :key="loc" :value="loc">
                        {{ loc }}
                    </option>
                </select>

                <span class="flex-1" />
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
                        <th class="col-th">Ações</th>
                    </tr>
                </thead>

                <tbody>
                    <tr v-for="p in lista" :key="p.id" class="linha">
                        <td class="col-td font-medium">{{ p.nome }}</td>
                        <td class="col-td text-tx-mid">{{ p.sku }}</td>
                        <td class="col-td">{{ p.categoria || "-" }}</td>
                        <td class="col-td text-tx-mid">{{ p.local || "-" }}</td>
                        <td class="col-td">{{ p.estoque }}</td>
                        <td class="col-td text-tx-mid">{{ p.minimo }}</td>
                        <td class="col-td">{{ formatarMoeda(p.preco) }}</td>
                        <td class="col-td">
                            <Etiqueta :status="statusEstoque(p.estoque, p.minimo)" />
                        </td>
                        <td class="col-td">
                            <div class="flex items-center gap-2">
                                <NuxtLink :to="`/produtos/${p.id}`" class="botao botao-ghost !py-1 !px-2"
                                    >Editar</NuxtLink
                                >
                                <button @click="excluirProduto(p.id)" class="botao botao-ghost !py-1 !px-2 text-red">
                                    Excluir
                                </button>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>

            <div class="paginacao">
                <span class="pag-info">{{ lista.length }} produtos</span>
            </div>
        </div>
    </div>
</template>
