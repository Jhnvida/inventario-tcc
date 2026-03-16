<script setup lang="ts">
defineProps<{
    titulo: string;
    subtitulo?: string;
}>();
</script>

<template>
    <div class="cabecalho-secao">
        <div>
            <div class="titulo-secao">{{ titulo }}</div>
            <div v-if="subtitulo" class="subtitulo-secao">{{ subtitulo }}</div>
        </div>

        <slot />
    </div>
</template>
