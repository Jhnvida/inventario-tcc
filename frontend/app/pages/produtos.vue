<script setup lang="ts">
import type { Produto } from "~/types";

definePageMeta({ titulo: "Produtos" });

const { data: produtos, pending, error, refresh } = useFetch<Produto[]>("/api/produtos", { lazy: true });

const busca = ref("");
const cat = ref("");
const local = ref("");
const abrir = ref(false);
const salvando = ref(false);
const erro = ref("");
const editId = ref<number | null>(null);
const ini = ref<Record<string, unknown>>({});

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
        .filter((local): local is string => Boolean(local))
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

function abrirNovoProduto() {
    erro.value = "";
    editId.value = null;
    ini.value = {};
    abrir.value = true;
}

function abrirEditarProduto(produto: Produto) {
    erro.value = "";
    editId.value = produto.id;
    ini.value = {
        nome: produto.nome || "",
        sku: produto.sku || "",
        categoriaId: produto.categoriaId || null,
        local: produto.local || "",
        estoque: Number(produto.estoque || 0),
        minimo: Number(produto.minimo || 0),
        preco: Number(produto.preco || 0),
    };
    abrir.value = true;
}

async function salvarProduto(payload: {
    nome: string;
    sku: string;
    categoriaId: number | null;
    local: string | null;
    estoque: number;
    minimo: number;
    preco: number;
}) {
    erro.value = "";
    if (!payload.nome || !payload.sku) {
        erro.value = "Preencha nome e SKU.";
        return;
    }

    if (payload.estoque < 0 || payload.minimo < 0 || payload.preco < 0) {
        erro.value = "Valores de estoque/minimo/preco devem ser >= 0.";
        return;
    }

    salvando.value = true;
    try {
        if (editId.value) {
            await $fetch(`/api/produtos/${editId.value}`, { method: "PUT", body: payload });
        } else {
            await $fetch("/api/produtos", { method: "POST", body: payload });
        }
        await refresh();
        abrir.value = false;
    } catch {
        erro.value = "Nao foi possivel salvar o produto.";
    } finally {
        salvando.value = false;
    }
}

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
    <div class="flex flex-col gap-4">
        <div v-if="pending" class="text-tx-soft text-[13px] px-4">Carregando produtos...</div>
        <div v-else-if="error" class="text-tx-soft text-[13px] px-4">Erro ao carregar produtos.</div>

        <div v-else-if="produtos" class="tbl-wrap">
            <div class="toolbar">
                <div class="busca">
                    <Icon name="lucide:search" class="w-[13px] h-[13px] text-tx-soft flex-shrink-0" />
                    <input v-model="busca" type="text" placeholder="Buscar produtos..." />
                </div>

                <select v-model="cat" class="filtro-sel">
                    <option value="">Todas as categorias</option>
                    <option v-for="cat in categorias" :key="cat" :value="cat">
                        {{ cat }}
                    </option>
                </select>

                <select v-model="local" class="filtro-sel">
                    <option value="">Todos os locais</option>
                    <option v-for="loc in locais" :key="loc" :value="loc">
                        {{ loc }}
                    </option>
                </select>

                <span class="flex-1" />

                <button @click="abrirNovoProduto" class="botao botao-primario text-[13px]">
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
                                <button @click="abrirEditarProduto(p)" class="botao botao-ghost !py-1 !px-2">
                                    Editar
                                </button>
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

        <Painel v-model:aberto="abrir" :titulo="editId ? 'Editar Produto' : 'Novo Produto'">
            <FormProduto
                :initial="ini"
                :erro="erro"
                :salvando="salvando"
                @cancelar="abrir = false"
                @salvar="salvarProduto"
            />
        </Painel>
    </div>
</template>
