<script setup lang="ts">
defineProps<{
    rotulo: string;
    valor: string;
    icone: string;
}>();
</script>

<template>
    <div class="bg-surface p-4">
        <div class="flex justify-between items-start">
            <div class="stat-rotulo">{{ rotulo }}</div>
            <Icon :name="icone" class="stat-icone" />
        </div>

        <div class="stat-valor">{{ valor }}</div>
    </div>
</template>

<style scoped>
.stat-rotulo {
    @apply text-[10.5px] font-semibold text-tx-soft uppercase tracking-[0.06em] mb-[7px];
}

.stat-valor {
    @apply text-[25px] font-semibold leading-none tracking-tight;
}

.stat-icone {
    @apply w-[14px] h-[14px] text-tx opacity-30 mt-0.5;
}
</style>
