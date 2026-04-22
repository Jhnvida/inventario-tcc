<script setup lang="ts">
interface ProdutoPayload {
    nome: string;
    sku: string;
    categoriaId: number | null;
    local: string | null;
    estoque: number;
    minimo: number;
    preco: number;
}

const props = defineProps<{
    initial?: Partial<ProdutoPayload>;
    erro?: string;
    salvando?: boolean;
}>();

const emit = defineEmits<{
    salvar: [payload: ProdutoPayload];
    cancelar: [];
}>();

const form = ref({
    nome: "",
    sku: "",
    categoriaId: "",
    local: "",
    estoque: 0,
    minimo: 0,
    preco: 0,
});

watch(
    () => props.initial,
    (valor) => {
        form.value = {
            nome: valor?.nome || "",
            sku: valor?.sku || "",
            categoriaId: valor?.categoriaId ? String(valor.categoriaId) : "",
            local: valor?.local || "",
            estoque: Number(valor?.estoque || 0),
            minimo: Number(valor?.minimo || 0),
            preco: Number(valor?.preco || 0),
        };
    },
    { immediate: true },
);

function enviar() {
    emit("salvar", {
        nome: form.value.nome.trim(),
        sku: form.value.sku.trim(),
        categoriaId: form.value.categoriaId ? Number(form.value.categoriaId) : null,
        local: form.value.local.trim() || null,
        estoque: Number(form.value.estoque),
        minimo: Number(form.value.minimo),
        preco: Number(form.value.preco),
    });
}
</script>

<template>
    <div class="flex flex-col gap-4">
        <div class="campo">
            <label class="label-form">Nome</label>
            <input v-model="form.nome" class="input-base" placeholder="Nome do produto" />
        </div>

        <div class="campo">
            <label class="label-form">SKU</label>
            <input v-model="form.sku" class="input-base" placeholder="SKU" />
        </div>

        <div class="campo">
            <label class="label-form">Categoria ID</label>
            <input v-model="form.categoriaId" type="number" min="1" class="input-base" placeholder="Opcional" />
        </div>

        <div class="campo">
            <label class="label-form">Local</label>
            <input v-model="form.local" class="input-base" placeholder="Localizacao" />
        </div>

        <div class="grid grid-cols-3 gap-3">
            <div class="campo">
                <label class="label-form">Estoque</label>
                <input v-model.number="form.estoque" type="number" min="0" class="input-base" />
            </div>

            <div class="campo">
                <label class="label-form">Mínimo</label>
                <input v-model.number="form.minimo" type="number" min="0" class="input-base" />
            </div>

            <div class="campo">
                <label class="label-form">Preço</label>
                <input v-model.number="form.preco" type="number" min="0" step="0.01" class="input-base" />
            </div>
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
