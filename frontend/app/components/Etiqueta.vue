<script setup lang="ts">
import type { StatusEstoque } from "~/types";

const props = defineProps<{
    status: StatusEstoque;
    rotulo?: string;
}>();

const rotulos = {
    ok: "Ok",
    alerta: "Alerta",
    critico: "Crítico",
    info: "Info",
    inativo: "Inativo",
};

const texto = computed(() => props.rotulo ?? rotulos[props.status]);
</script>

<template>
    <span class="etiqueta" :class="`etiqueta-${status}`">
        <span class="ponto" :class="`ponto-${status}`"></span>
        {{ texto }}
    </span>
</template>
