<script setup lang="ts">
import { nextTick } from "vue";

definePageMeta({ titulo: "Agente IA" });

const mensagens = ref([
    {
        remetente: "bot",
        texto: "Olá! Posso ajudar com consultas rápidas sobre produtos, pedidos e movimentações.",
        data: new Date(),
    },
]);

const novaMensagem = ref("");
const areaMensagens = ref<HTMLElement | null>(null);

const atalhos = ["Resumo de estoque", "Pedidos pendentes", "Produtos em alerta"];

function rolarParaFim() {
    nextTick(() => {
        if (!areaMensagens.value) return;
        areaMensagens.value.scrollTop = areaMensagens.value.scrollHeight;
    });
}

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
            texto: "Recebi sua mensagem. Em seguida, posso te ajudar com um resumo de estoque, pedidos pendentes ou movimentações recentes.",
            data: new Date(),
        });
        rolarParaFim();
    }, 1000);

    rolarParaFim();
}

function usarAtalho(texto: string) {
    novaMensagem.value = texto;
}

onMounted(rolarParaFim);
</script>

<template>
    <div class="mx-auto flex h-[calc(100vh-150px)] min-h-[520px] w-full max-w-6xl flex-col gap-4">
        <Cabecalho titulo="Agente IA" subtitulo="Converse com o assistente para apoio nas operações de estoque" />

        <div class="flex-1 min-h-0 border border-line bg-surface p-5">
            <div class="flex h-full min-h-0 flex-col gap-3">
                <div ref="areaMensagens" class="flex-1 min-h-0 overflow-y-auto border border-line bg-bg p-3">
                    <div class="flex flex-col gap-3">
                        <div
                            v-for="(m, idx) in mensagens"
                            :key="idx"
                            :class="[
                                'max-w-[88%] border px-3 py-2.5 text-[13px] leading-relaxed',
                                m.remetente === 'bot'
                                    ? 'self-start border-line bg-surface2 text-tx-mid'
                                    : 'self-end border-tx bg-tx text-white shadow-sm',
                            ]"
                        >
                            {{ m.texto }}
                        </div>
                    </div>
                </div>

                <div class="mt-auto flex flex-col gap-3 border border-line bg-surface p-3">
                    <div class="flex flex-wrap gap-2">
                        <button
                            v-for="atalho in atalhos"
                            :key="atalho"
                            @click="usarAtalho(atalho)"
                            class="border border-line bg-bg px-3 py-1.5 text-[11px] font-medium text-tx-soft transition-colors hover:border-tx-soft hover:text-tx"
                        >
                            {{ atalho }}
                        </button>
                    </div>

                    <div class="flex items-end gap-2">
                        <textarea
                            v-model="novaMensagem"
                            placeholder="Digite sua mensagem..."
                            class="input-base h-9 flex-1 resize-none py-3"
                            @keydown.enter.prevent="enviarMensagem"
                        />

                        <button
                            @click="enviarMensagem"
                            class="flex h-9 w-9 items-center justify-center border border-tx bg-tx text-white transition-colors hover:bg-black"
                        >
                            <Icon name="lucide:arrow-right" class="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
