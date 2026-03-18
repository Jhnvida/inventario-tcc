<script setup lang="ts">
const route = useRoute();
const titulo = computed(() => route.meta.titulo as string);
</script>

<template>
    <div class="flex h-screen">
        <aside class="w-[220px] bg-surface border-r border-line flex flex-col flex-shrink-0">
            <div class="h-[52px] border-b border-line flex items-center px-[18px] gap-[9px] flex-shrink-0">
                <span class="text-[14px] font-semibold tracking-[-0.3px]">Inventário</span>
            </div>

            <nav class="flex-1 px-[10px] py-2 overflow-y-auto">
                <div class="mb-5">
                    <div class="nav-rotulo">Visão geral</div>

                    <NuxtLink to="/" exact-active-class="ativo" class="item-nav">
                        <Icon name="lucide:layout-grid" class="w-[14px] h-[14px] flex-shrink-0" />
                        Dashboard
                    </NuxtLink>
                </div>

                <div class="mb-5">
                    <div class="nav-rotulo">Estoque</div>

                    <NuxtLink to="/produtos" active-class="ativo" class="item-nav">
                        <Icon name="lucide:package" class="w-[14px] h-[14px] flex-shrink-0" />
                        Produtos
                    </NuxtLink>

                    <NuxtLink to="/fornecedores" active-class="ativo" class="item-nav">
                        <Icon name="lucide:users" class="w-[14px] h-[14px] flex-shrink-0" />
                        Fornecedores
                    </NuxtLink>

                    <NuxtLink to="/pedidos" active-class="ativo" class="item-nav">
                        <Icon name="lucide:clipboard-check" class="w-[14px] h-[14px] flex-shrink-0" />
                        Pedidos
                    </NuxtLink>
                </div>

                <div>
                    <div class="nav-rotulo">Ferramentas</div>

                    <div class="item-nav cursor-pointer">
                        <Icon name="lucide:sparkles" class="w-[14px] h-[14px] flex-shrink-0" />
                        Agente IA
                    </div>
                </div>
            </nav>

            <div class="border-t border-line px-[10px] py-[6px]">
                <div class="usuario">
                    <div class="avatar">A</div>

                    <div>
                        <div class="usuario-nome">Admin</div>
                        <div class="usuario-cargo">Administrador</div>
                    </div>
                </div>
            </div>
        </aside>

        <div class="flex-1 flex flex-col min-w-0">
            <header class="h-[52px] bg-surface border-b border-line flex items-center px-[30px] gap-2.5 flex-shrink-0">
                <span class="text-[14.5px] font-semibold flex-1 tracking-[-0.2px]">{{ titulo }}</span>

                <button class="botao botao-ghost text-[13px]">
                    <Icon name="lucide:sparkles" class="w-[13px] h-[13px]" />
                    Agente IA
                </button>
            </header>

            <main class="flex-1 h-screen overflow-y-auto p-8">
                <slot />
            </main>
        </div>
    </div>
</template>

<style scoped>
.nav-rotulo {
    @apply text-[10px] font-semibold text-tx-soft uppercase tracking-[0.08em] px-2 mb-0.5;
}

.item-nav {
    @apply flex items-center gap-[9px] px-2 py-[7px] text-tx-mid text-[13px] border-l-2 border-transparent transition-colors duration-75 select-none;
}

.item-nav:hover {
    background: #f3f3f3;
    @apply text-tx;
}

:deep(.ativo) {
    @apply bg-blue-bg text-blue font-medium border-l-blue;
}

.usuario {
    @apply flex items-center gap-[9px] px-2 py-2.5 mt-1;
}

.avatar {
    @apply w-[26px] h-[26px] bg-blue-dim text-blue flex items-center justify-center text-[9.5px] font-bold flex-shrink-0;
}

.usuario-nome {
    @apply text-[12.5px] font-medium;
}

.usuario-cargo {
    @apply text-[11px] text-tx-soft;
}
</style>
