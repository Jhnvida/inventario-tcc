<script setup lang="ts">
import type { Produto, Fornecedor } from "~/types";

interface ItemPedidoPayload {
    produtoId: number;
    quantidade: number;
    precoUnitario: number;
}

interface PedidoPayload {
    fornecedorId: number;
    previsao: string | null;
    observacoes: string | null;
    itens: ItemPedidoPayload[];
}

const props = defineProps<{
    initial?: {
        fornecedorId?: number | null;
        previsao?: string | null;
        observacoes?: string | null;
        itens?: ItemPedidoPayload[];
    };
    erro?: string;
    salvando?: boolean;
}>();

const emit = defineEmits<{
    salvar: [payload: PedidoPayload];
    cancelar: [];
}>();

const { data: fornecedores } = useFetch<Fornecedor[]>("/api/fornecedores");
const { data: produtos } = useFetch<Produto[]>("/api/produtos");

const form = ref({
    fornecedorId: "",
    previsao: "",
    observacoes: "",
    itens: [] as Array<{ produtoId: string; quantidade: number; precoUnitario: number }>,
});

watch(
    () => props.initial,
    (valor) => {
        const itens = valor?.itens?.length
            ? valor.itens.map((item) => ({
                  produtoId: String(item.produtoId),
                  quantidade: Number(item.quantidade || 1),
                  precoUnitario: Number(item.precoUnitario || 0),
              }))
            : [{ produtoId: "", quantidade: 1, precoUnitario: 0 }];

        form.value = {
            fornecedorId: valor?.fornecedorId ? String(valor.fornecedorId) : "",
            previsao: valor?.previsao || "",
            observacoes: valor?.observacoes || "",
            itens,
        };
    },
    { immediate: true },
);

function adicionarItem() {
    form.value.itens.push({
        produtoId: "",
        quantidade: 1,
        precoUnitario: 0,
    });
}

function removerItem(index: number) {
    form.value.itens.splice(index, 1);
}

function aoSelecionarProduto(index: number) {
    const item = form.value.itens[index];
    if (!item) return;

    const produto = produtos.value?.find((p) => p.id === Number(item.produtoId));
    if (produto) {
        item.precoUnitario = Number(produto.preco);
    }
}

const totalPedido = computed(() => {
    return form.value.itens.reduce((acc, item) => {
        return acc + item.quantidade * item.precoUnitario;
    }, 0);
});

function enviar() {
    emit("salvar", {
        fornecedorId: Number(form.value.fornecedorId),
        previsao: form.value.previsao || null,
        observacoes: form.value.observacoes.trim() || null,
        itens: form.value.itens.map((item) => ({
            produtoId: Number(item.produtoId),
            quantidade: Number(item.quantidade),
            precoUnitario: Number(item.precoUnitario),
        })),
    });
}
</script>

<template>
    <div class="flex flex-col gap-8">
        <section class="form-secao">
            <h3 class="titulo-secao">Informações Gerais</h3>

            <div class="grid grid-cols-1 gap-5">
                <div class="campo">
                    <label class="label-form">Fornecedor</label>

                    <select v-model="form.fornecedorId" class="input-base">
                        <option value="">Selecione um fornecedor</option>
                        <option v-for="f in fornecedores" :key="f.id" :value="f.id">
                            {{ f.razaoSocial }}
                        </option>
                    </select>
                </div>

                <div class="campo">
                    <label class="label-form">Previsão de Entrega</label>
                    <input type="date" v-model="form.previsao" class="input-base" />
                </div>

                <div class="campo">
                    <label class="label-form">Observações</label>

                    <textarea
                        v-model="form.observacoes"
                        class="input-base min-h-[70px] py-2"
                        placeholder="Informações adicionais..."
                    />
                </div>
            </div>
        </section>

        <section class="form-secao">
            <div class="flex items-center justify-between">
                <h3 class="titulo-secao">Itens do Pedido</h3>
                <button
                    @click="adicionarItem"
                    class="text-blue text-[11px] font-semibold hover:opacity-70 flex items-center gap-1 uppercase tracking-wider"
                >
                    <Icon name="lucide:plus" class="w-3 h-3" />
                    Adicionar Item
                </button>
            </div>

            <div class="flex flex-col gap-[1px] bg-line border border-line overflow-hidden text-tx">
                <div v-for="(item, idx) in form.itens" :key="idx" class="px-4 py-3 bg-surface relative group">
                    <button
                        v-if="form.itens.length > 1"
                        @click="removerItem(idx)"
                        class="absolute top-2 right-2 w-5 h-5 text-tx-soft hover:text-red transition-colors opacity-0 group-hover:opacity-100"
                    >
                        <Icon name="lucide:trash-2" class="w-3.5 h-3.5" />
                    </button>

                    <div class="grid grid-cols-12 gap-x-4 gap-y-3">
                        <div class="col-span-12 md:col-span-6 campo">
                            <label class="label-form !text-[9px]">Produto</label>

                            <select
                                v-model="item.produtoId"
                                @change="aoSelecionarProduto(idx)"
                                class="input-base !py-1 !px-2 text-[12px]"
                            >
                                <option value="">Selecionar...</option>
                                <option v-for="p in produtos" :key="p.id" :value="p.id">
                                    {{ p.nome }}
                                </option>
                            </select>
                        </div>

                        <div class="col-span-6 md:col-span-3 campo">
                            <label class="label-form !text-[9px]">Qtd</label>

                            <input
                                type="number"
                                v-model.number="item.quantidade"
                                min="1"
                                class="input-base !py-1 !px-2 text-[12px]"
                            />
                        </div>

                        <div class="col-span-6 md:col-span-3 campo">
                            <label class="label-form !text-[9px]">Unitário</label>

                            <input
                                type="number"
                                v-model.number="item.precoUnitario"
                                step="0.01"
                                class="input-base !py-1 !px-2 text-[12px]"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <div class="mt-4 p-4 bg-tx text-white flex items-center justify-between">
            <span class="text-[12px] opacity-70">Total do Pedido</span>
            <span class="text-[18px] font-bold">{{ formatarMoeda(totalPedido) }}</span>
        </div>

        <div class="flex items-center gap-3 pt-4">
            <button @click="enviar" :disabled="salvando" class="botao botao-primario flex-1 justify-center py-2.5">
                {{ salvando ? "Salvando..." : "Salvar Pedido" }}
            </button>
            <button @click="emit('cancelar')" class="botao botao-secundario px-6 py-2.5">Cancelar</button>
        </div>

        <p v-if="erro" class="text-[12px] text-red">{{ erro }}</p>
    </div>
</template>

<style scoped></style>
