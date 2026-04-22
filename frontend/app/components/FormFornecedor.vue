<script setup lang="ts">
interface FornecedorPayload {
    razaoSocial: string;
    nomeFantasia: string | null;
    cnpj: string | null;
    contato: string | null;
    telefone: string | null;
    prazoMedio: number;
    ativo: boolean;
}

const props = defineProps<{
    initial?: Partial<FornecedorPayload>;
    erro?: string;
    salvando?: boolean;
}>();

const emit = defineEmits<{
    salvar: [payload: FornecedorPayload];
    cancelar: [];
}>();

const form = ref({
    razaoSocial: "",
    nomeFantasia: "",
    cnpj: "",
    contato: "",
    telefone: "",
    prazoMedio: 0,
    ativo: true,
});

watch(
    () => props.initial,
    (valor) => {
        form.value = {
            razaoSocial: valor?.razaoSocial || "",
            nomeFantasia: valor?.nomeFantasia || "",
            cnpj: valor?.cnpj || "",
            contato: valor?.contato || "",
            telefone: valor?.telefone || "",
            prazoMedio: Number(valor?.prazoMedio || 0),
            ativo: valor?.ativo ?? true,
        };
    },
    { immediate: true },
);

function enviar() {
    emit("salvar", {
        razaoSocial: form.value.razaoSocial.trim(),
        nomeFantasia: form.value.nomeFantasia.trim() || null,
        cnpj: form.value.cnpj.trim() || null,
        contato: form.value.contato.trim() || null,
        telefone: form.value.telefone.trim() || null,
        prazoMedio: Number(form.value.prazoMedio),
        ativo: form.value.ativo,
    });
}
</script>

<template>
    <div class="flex flex-col gap-4">
        <div class="campo">
            <label class="label-form">Razão Social</label>
            <input v-model="form.razaoSocial" class="input-base" placeholder="Razao social" />
        </div>

        <div class="campo">
            <label class="label-form">Nome Fantasia</label>
            <input v-model="form.nomeFantasia" class="input-base" placeholder="Opcional" />
        </div>

        <div class="grid grid-cols-2 gap-3">
            <div class="campo">
                <label class="label-form">CNPJ</label>
                <input v-model="form.cnpj" class="input-base" placeholder="Opcional" />
            </div>

            <div class="campo">
                <label class="label-form">Contato</label>
                <input v-model="form.contato" class="input-base" placeholder="Opcional" />
            </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
            <div class="campo">
                <label class="label-form">Telefone</label>
                <input v-model="form.telefone" class="input-base" placeholder="Opcional" />
            </div>

            <div class="campo">
                <label class="label-form">Prazo Médio (dias)</label>
                <input v-model.number="form.prazoMedio" type="number" min="0" class="input-base" />
            </div>
        </div>

        <div class="campo">
            <label class="label-form">Status</label>
            <select v-model="form.ativo" class="input-base">
                <option :value="true">Ativo</option>
                <option :value="false">Inativo</option>
            </select>
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
