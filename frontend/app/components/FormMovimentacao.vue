<script setup lang="ts">
import type { Produto } from "~/types";

interface MovimentacaoPayload {
    produtoId: number;
    tipo: "entrada" | "saida";
    quantidade: number;
    observacao: string | null;
    responsavelId: number;
    pedidoId: number | null;
}

const props = defineProps<{
    initial?: Partial<MovimentacaoPayload>;
    erro?: string;
    salvando?: boolean;
}>();

const emit = defineEmits<{
    salvar: [payload: MovimentacaoPayload];
    cancelar: [];
}>();

const { data: produtos } = useFetch<Produto[]>("/api/produtos");

const form = ref({
    produtoId: "",
    tipo: "entrada" as "entrada" | "saida",
    quantidade: 1,
    observacao: "",
    responsavelId: 1,
    pedidoId: "",
});

watch(
    () => props.initial,
    (valor) => {
        form.value = {
            produtoId: valor?.produtoId ? String(valor.produtoId) : "",
            tipo: valor?.tipo || "entrada",
            quantidade: Number(valor?.quantidade || 1),
            observacao: valor?.observacao || "",
            responsavelId: Number(valor?.responsavelId || 1),
            pedidoId: valor?.pedidoId ? String(valor.pedidoId) : "",
        };
    },
    { immediate: true },
);

function enviar() {
    emit("salvar", {
        produtoId: Number(form.value.produtoId),
        tipo: form.value.tipo,
        quantidade: Number(form.value.quantidade),
        observacao: form.value.observacao.trim() || null,
        responsavelId: Number(form.value.responsavelId),
        pedidoId: form.value.pedidoId ? Number(form.value.pedidoId) : null,
    });
}
</script>

<template>
    <div class="flex flex-col gap-4">
        <div class="campo">
            <label class="label-form">Produto</label>
            <select v-model="form.produtoId" class="input-base">
                <option value="">Selecione um produto</option>
                <option v-for="produto in produtos" :key="produto.id" :value="produto.id">
                    {{ produto.nome }} ({{ produto.sku }})
                </option>
            </select>
        </div>

        <div class="grid grid-cols-2 gap-3">
            <div class="campo">
                <label class="label-form">Tipo</label>
                <select v-model="form.tipo" class="input-base">
                    <option value="entrada">Entrada</option>
                    <option value="saida">Saida</option>
                </select>
            </div>

            <div class="campo">
                <label class="label-form">Quantidade</label>
                <input v-model.number="form.quantidade" type="number" min="1" class="input-base" />
            </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
            <div class="campo">
                <label class="label-form">Responsável ID</label>
                <input v-model.number="form.responsavelId" type="number" min="1" class="input-base" />
            </div>

            <div class="campo">
                <label class="label-form">Pedido ID (opcional)</label>
                <input v-model="form.pedidoId" type="number" min="1" class="input-base" />
            </div>
        </div>

        <div class="campo">
            <label class="label-form">Observação</label>
            <textarea v-model="form.observacao" class="input-base min-h-[70px] py-2" placeholder="Opcional" />
        </div>

        <p v-if="erro" class="text-[12px] text-red">{{ erro }}</p>

        <div class="flex items-center justify-end gap-2">
            <button @click="emit('cancelar')" class="botao botao-secundario">Cancelar</button>
            <button @click="enviar" :disabled="salvando" class="botao botao-primario">
                {{ salvando ? "Salvando..." : "Salvar" }}
            </button>
        </div>
    </div>
</template>
