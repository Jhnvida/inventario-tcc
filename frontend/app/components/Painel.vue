<script setup lang="ts">
const { aberto, fecharPainel } = usePainel();
</script>

<template>
    <Teleport to="body">
        <Transition name="overlay">
            <div v-if="aberto" class="painel-overlay" @click.self="fecharPainel">
                <Transition name="painel" appear>
                    <div v-if="aberto" class="painel-ia">
                        <div class="painel-cabecalho">
                            <span class="painel-titulo">Agente de IA</span>

                            <button class="painel-fechar" @click="fecharPainel">
                                <Icon name="lucide:x" class="w-[14px] h-[14px]" />
                            </button>
                        </div>

                        <div class="painel-msgs">
                            <div class="msg msg-bot">
                                <div class="bubble">
                                    Olá! Sou o agente de IA do Inventário. Posso ajudar com análises de estoque,
                                    sugestões de reposição e muito mais. O que você precisa?
                                </div>
                                <div class="msg-hora">agora</div>
                            </div>
                        </div>

                        <div class="painel-rodape">
                            <div class="chips">
                                <button class="chip">Produtos críticos?</button>
                                <button class="chip">O que pedir essa semana?</button>
                                <button class="chip">Resumo do estoque</button>
                            </div>

                            <div class="input-row">
                                <input class="input-msg" placeholder="Faça uma pergunta…" />

                                <button class="botao-enviar">
                                    <Icon name="lucide:send" class="w-[12px] h-[12px]" />
                                </button>
                            </div>
                        </div>
                    </div>
                </Transition>
            </div>
        </Transition>
    </Teleport>
</template>

<style scoped>
.painel-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.28);
    z-index: 100;
    display: flex;
    align-items: stretch;
    justify-content: flex-end;
}

.painel-ia {
    width: 365px;
    background: #ffffff;
    border-left: 1px solid #e0e0e0;
    display: flex;
    flex-direction: column;
    height: 100%;
}

.painel-cabecalho {
    height: 52px;
    padding: 0 15px;
    border-bottom: 1px solid #e0e0e0;
    display: flex;
    align-items: center;
    gap: 10px;
    flex-shrink: 0;
}

.painel-titulo {
    font-size: 13.5px;
    font-weight: 600;
    flex: 1;
}

.painel-fechar {
    background: none;
    border: none;
    cursor: pointer;
    color: #9a9a9a;
    display: flex;
    align-items: center;
    padding: 3px;
}

.painel-fechar:hover {
    color: #1a1a1a;
    background: #f5f5f5;
}

.painel-msgs {
    flex: 1;
    overflow-y: auto;
    padding: 15px;
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.msg {
    max-width: 90%;
}

.msg-bot {
    align-self: flex-start;
}

.bubble {
    padding: 9px 12px;
    font-size: 12.5px;
    line-height: 1.55;
    background: #f2f2f2;
    color: #1a1a1a;
    border: 1px solid #e0e0e0;
}

.msg-hora {
    font-size: 10px;
    color: #9a9a9a;
    margin-top: 3px;
}

.painel-rodape {
    padding: 12px 15px;
    border-top: 1px solid #e0e0e0;
    flex-shrink: 0;
}

.chips {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
    margin-bottom: 9px;
}

.chip {
    font-size: 11.5px;
    padding: 3px 9px;
    border: 1px solid #d0d0d0;
    background: #ffffff;
    color: #5a5a5a;
    cursor: pointer;
    font-family: inherit;
}

.chip:hover {
    border-color: #1e40af;
    color: #1e40af;
    background: #eff6ff;
}

.input-row {
    display: flex;
    gap: 7px;
}

.input-msg {
    flex: 1;
    border: 1px solid #d0d0d0;
    padding: 7px 10px;
    font-family: inherit;
    font-size: 13px;
    color: #1a1a1a;
    background: #f5f5f5;
    outline: none;
}

.input-msg:focus {
    border-color: #1e40af;
}

.botao-enviar {
    background: #1a1a1a;
    color: #fff;
    border: none;
    width: 34px;
    height: 34px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.botao-enviar:hover {
    background: #333;
}

.overlay-enter-active,
.overlay-leave-active {
    transition: background 0.15s ease;
}

.overlay-enter-from,
.overlay-leave-to {
    background: rgba(0, 0, 0, 0);
}

.painel-enter-active,
.painel-leave-active {
    transition:
        transform 0.15s ease,
        opacity 0.15s ease;
}

.painel-enter-from,
.painel-leave-to {
    transform: translateX(20px);
    opacity: 0;
}
</style>
