<script setup lang="ts">
const mensagens = ref([
    {
        remetente: "bot",
        texto: "Olá! Eu sou o seu Agente de Inventário Inteligente. Como posso ajudar você hoje?",
        data: new Date(),
    },
]);

const novaMensagem = ref("");

function enviarMensagem() {
    if (!novaMensagem.value.trim()) return;

    mensagens.value.push({
        remetente: "usuario",
        texto: novaMensagem.value,
        data: new Date(),
    });

    novaMensagem.value = "";

    setTimeout(() => {
        mensagens.value.push({
            remetente: "bot",
            texto: "Entendi sua dúvida. Como este é um sistema de TCC, estou configurado para demonstrar a interface de interação inteligente. Em breve poderei analisar seu estoque em tempo real!",
            data: new Date(),
        });
    }, 1000);
}
</script>

<template>
    <div class="flex flex-col h-full gap-5">
        <div class="flex-1 overflow-y-auto flex flex-col gap-4 p-1">
            <div
                v-for="(m, idx) in mensagens"
                :key="idx"
                :class="[
                    'max-w-[90%] p-3 text-[13px] leading-relaxed relative border',
                    m.remetente === 'bot'
                        ? 'bg-surface2 text-tx-mid self-start border-line'
                        : 'bg-tx text-white self-end border-tx shadow-sm',
                ]"
            >
                {{ m.texto }}
            </div>
        </div>

        <div class="mt-auto border-t border-line pt-5 bg-surface flex flex-col gap-4">
            <div class="flex flex-wrap gap-2">
                <button
                    class="px-2.5 py-1 bg-bg border border-line text-[10px] font-semibold text-tx-soft hover:border-tx-soft hover:text-tx transition-colors uppercase tracking-wider"
                >
                    Resumo de estoque
                </button>

                <button
                    class="px-2.5 py-1 bg-bg border border-line text-[10px] font-semibold text-tx-soft hover:border-tx-soft hover:text-tx transition-colors uppercase tracking-wider"
                >
                    Previsão de pedidos
                </button>
            </div>

            <div class="relative">
                <textarea
                    v-model="novaMensagem"
                    placeholder="Pergunte ao agende..."
                    class="input-base min-h-[90px] pr-12 resize-none py-3"
                    @keydown.enter.prevent="enviarMensagem"
                />

                <button
                    @click="enviarMensagem"
                    class="absolute bottom-2.5 right-2.5 w-7 h-7 bg-tx text-white flex items-center justify-center hover:bg-black transition-colors"
                >
                    <Icon name="lucide:arrow-right" class="w-4 h-4" />
                </button>
            </div>

            <p class="text-[10px] text-tx-soft text-center uppercase tracking-widest opacity-60">
                IA em fase de testes • TCC Inventário
            </p>
        </div>
    </div>
</template>
