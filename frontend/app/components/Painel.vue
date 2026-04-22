<script setup lang="ts">
const aberto = defineModel<boolean>("aberto", { default: false });
defineProps<{
    titulo: string;
}>();
</script>

<template>
    <Teleport to="body">
        <Transition
            enter-active-class="transition-opacity duration-300 ease-out"
            enter-from-class="opacity-0"
            enter-to-class="opacity-100"
            leave-active-class="transition-opacity duration-200 ease-in"
            leave-from-class="opacity-100"
            leave-to-class="opacity-0"
        >
            <div v-if="aberto" class="fixed inset-0 bg-tx/40 backdrop-blur-[2px] z-[100]" @click="aberto = false" />
        </Transition>

        <Transition
            enter-active-class="transition-transform duration-300 ease-out"
            enter-from-class="translate-x-full"
            enter-to-class="translate-x-0"
            leave-active-class="transition-transform duration-200 ease-in"
            leave-from-class="translate-x-0"
            leave-to-class="translate-x-full"
        >
            <div
                v-if="aberto"
                class="fixed top-0 right-0 h-full w-full max-w-[500px] bg-surface border-l border-line shadow-2xl z-[101] flex flex-col"
            >
                <div class="flex items-center justify-between px-6 py-4 border-b border-line bg-surface">
                    <h2 class="titulo-secao !text-[15px]">{{ titulo }}</h2>
                    <button
                        @click="aberto = false"
                        class="p-1.5 hover:bg-bg transition-colors text-tx-soft hover:text-tx"
                    >
                        <Icon name="lucide:x" class="w-5 h-5" />
                    </button>
                </div>

                <div class="flex-1 overflow-y-auto p-6">
                    <slot />
                </div>

                <div v-if="$slots.rodape" class="px-6 py-4 border-t border-line bg-surface2">
                    <slot name="rodape" />
                </div>
            </div>
        </Transition>
    </Teleport>
</template>

<style scoped></style>
