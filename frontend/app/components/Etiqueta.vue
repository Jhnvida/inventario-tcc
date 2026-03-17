<script setup lang="ts">
defineProps<{
    status: "ok" | "alerta" | "critico" | "info" | "inativo";
}>();

const rotulos: Record<string, string> = {
    ok: "Ok",
    alerta: "Alerta",
    critico: "Crítico",
    info: "Info",
    inativo: "Inativo",
};
</script>

<template>
    <span class="etiqueta" :class="`etiqueta-${status}`">
        <span class="ponto" :class="`ponto-${status}`"></span>
        {{ rotulos[status] }}
    </span>
</template>
