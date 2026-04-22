<script setup lang="ts">
import type { Movimentacao } from "~/types";
definePageMeta({ titulo: "Movimentações" });

const { data: movs, pending, error, refresh } = useLazyFetch<Movimentacao[]>("/api/movimentacoes");

const abrir = ref(false);
const salvando = ref(false);
const erro = ref("");
const busca = ref("");
const tipo = ref("");

const lista = computed(() => {
    const termo = busca.value.trim().toLowerCase();
    return (movs.value || []).filter((m) => {
        const correspondeBusca =
            !termo ||
            m.produto.toLowerCase().includes(termo) ||
            m.sku.toLowerCase().includes(termo) ||
            (m.responsavel || "").toLowerCase().includes(termo);
        const correspondeTipo = !tipo.value || m.tipo === tipo.value;
        return correspondeBusca && correspondeTipo;
    });
});

async function salvar(payload: {
    produtoId: number;
    tipo: "entrada" | "saida";
    quantidade: number;
    observacao: string | null;
    responsavelId: number;
    pedidoId: number | null;
}) {
    erro.value = "";
    if (!payload.produtoId || !payload.responsavelId || payload.quantidade <= 0) {
        erro.value = "Preencha produto, responsavel e quantidade.";
        return;
    }

    salvando.value = true;
    try {
        await $fetch("/api/movimentacoes", {
            method: "POST",
            body: payload,
        });
        await refresh();
        abrir.value = false;
    } catch {
        erro.value = "Nao foi possivel salvar a movimentacao.";
    } finally {
        salvando.value = false;
    }
}
</script>

<template>
    <div class="flex flex-col gap-4">
        <div v-if="pending" class="text-tx-soft text-[13px] px-4">Carregando movimentações...</div>
        <div v-else-if="error" class="text-tx-soft text-[13px] px-4">Erro ao carregar movimentações.</div>

        <div v-else-if="movs" class="tbl-wrap">
            <div class="toolbar">
                <div class="busca">
                    <Icon name="lucide:search" class="w-[13px] h-[13px] text-tx-soft flex-shrink-0" />
                    <input v-model="busca" type="text" placeholder="Buscar produto, SKU..." />
                </div>

                <select v-model="tipo" class="filtro-sel">
                    <option value="">Todos os tipos</option>
                    <option value="entrada">Entrada</option>
                    <option value="saida">Saída</option>
                </select>

                <span class="flex-1" />

                <button @click="abrir = true" class="botao botao-primario text-[13px]">
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
                    <tr v-for="m in lista" :key="m.id" class="linha">
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
                <span class="pag-info">{{ lista.length }} movimentações</span>
            </div>
        </div>

        <Painel v-model:aberto="abrir" titulo="Nova Movimentacao">
            <FormMovimentacao :erro="erro" :salvando="salvando" @cancelar="abrir = false" @salvar="salvar" />
        </Painel>
    </div>
</template>
