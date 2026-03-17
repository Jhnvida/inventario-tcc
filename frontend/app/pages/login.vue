<script setup lang="ts">
definePageMeta({ layout: "auth" });

const email = ref("");
const senha = ref("");
const carregando = ref(false);
const erroEmail = ref(false);
const erroSenha = ref(false);
const mensagemErro = ref("");

const itensAlerta = [
    { nome: "Headset USB HX100", qtd: "1 un", min: "mín 12", critico: true },
    { nome: "Mouse Sem Fio M320", qtd: "2 un", min: "mín 10", critico: true },
    { nome: "Teclado Mecânico TK200", qtd: "7 un", min: "mín 15", critico: false },
    { nome: "Cabo HDMI 2.0 2m", qtd: "4 un", min: "mín 20", critico: true },
    { nome: 'Monitor 24" Full HD', qtd: "3 un", min: "mín 8", critico: false },
];

async function entrar() {
    erroEmail.value = false;
    erroSenha.value = false;
    mensagemErro.value = "";

    if (!email.value || !senha.value) {
        mensagemErro.value = "Preencha e-mail e senha.";
        if (!email.value) erroEmail.value = true;
        if (!senha.value) erroSenha.value = true;
        return;
    }

    carregando.value = true;
    await new Promise((r) => setTimeout(r, 900));
    carregando.value = false;

    navigateTo("/");
}
</script>

<template>
    <div class="login-wrap">
        <div class="painel-esquerdo">
            <div class="logo-topo">
                <span class="logo-nome">Inventário</span>
            </div>

            <div class="area-formulario">
                <h1 class="titulo-login">Bem-vindo de volta</h1>
                <p class="subtitulo-login">Entre com sua conta para acessar o painel.</p>

                <form @submit.prevent="entrar">
                    <div class="campo">
                        <label for="email">E-mail</label>
                        <input
                            id="email"
                            v-model="email"
                            type="email"
                            placeholder="voce@empresa.com.br"
                            autocomplete="email"
                            :class="{ erro: erroEmail }"
                        />
                    </div>

                    <div class="campo">
                        <label for="senha">Senha</label>
                        <input
                            id="senha"
                            v-model="senha"
                            type="password"
                            placeholder="••••••••"
                            autocomplete="current-password"
                            :class="{ erro: erroSenha }"
                        />
                        <span v-if="mensagemErro" class="msg-erro">{{ mensagemErro }}</span>
                    </div>

                    <div class="link-esqueceu">Esqueceu a senha?</div>

                    <button type="submit" class="botao-entrar" :class="{ carregando }">
                        <span v-if="!carregando" class="btn-label">Entrar</span>
                        <span v-else class="spinner" />
                    </button>
                </form>
            </div>
        </div>

        <div class="painel-direito">
            <div class="painel-direito-inner">
                <p class="tagline">
                    Controle total do seu estoque.<br />
                    <strong>Precisão em cada operação.</strong>
                </p>

                <div class="grid-stats">
                    <div class="stat-card">
                        <div class="stat-rotulo">Valor Total</div>
                        <div class="stat-valor">R$487k</div>
                        <div class="stat-sub">↑ 4,2% este mês</div>
                    </div>

                    <div class="stat-card">
                        <div class="stat-rotulo">Produtos</div>
                        <div class="stat-valor">1.248</div>
                        <div class="stat-sub">Em 14 categorias</div>
                    </div>

                    <div class="stat-card stat-alerta">
                        <div class="stat-rotulo">Em Alerta</div>
                        <div class="stat-valor">23</div>
                        <div class="stat-sub">Abaixo do mínimo</div>
                    </div>

                    <div class="stat-card">
                        <div class="stat-rotulo">Pedidos</div>
                        <div class="stat-valor">8</div>
                        <div class="stat-sub">3 entregando hoje</div>
                    </div>
                </div>

                <div class="preview-estoque">
                    <div class="preview-cabecalho">
                        <span class="preview-titulo">Estoque Crítico</span>
                        <span class="preview-badge">5 itens</span>
                    </div>

                    <div v-for="item in itensAlerta" :key="item.nome" class="preview-linha">
                        <div class="ponto-status" :class="item.critico ? 'ponto-critico' : 'ponto-alerta-cor'" />
                        <div class="item-nome">{{ item.nome }}</div>
                        <div class="item-qtd" :class="item.critico ? 'qtd-critico' : 'qtd-alerta'">{{ item.qtd }}</div>
                        <div class="item-min">{{ item.min }}</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.login-wrap {
    display: flex;
    height: 100vh;
    width: 100vw;
    background: #fff;
}

.painel-esquerdo {
    width: 420px;
    flex-shrink: 0;
    background: #fff;
    border-right: 1px solid #e0e0e0;
    display: flex;
    flex-direction: column;
}

.logo-topo {
    padding: 28px 40px 0;
    display: flex;
    align-items: center;
    gap: 9px;
}

.logo-nome {
    font-size: 14px;
    font-weight: 600;
    letter-spacing: -0.3px;
}

.area-formulario {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 0 40px 48px;
}

.titulo-login {
    font-size: 22px;
    font-weight: 600;
    letter-spacing: -0.5px;
    margin-bottom: 6px;
}

.subtitulo-login {
    font-size: 13px;
    color: #5a5a5a;
    margin-bottom: 28px;
}

.campo {
    display: flex;
    flex-direction: column;
    gap: 5px;
    margin-bottom: 14px;
}

.campo label {
    font-size: 11.5px;
    font-weight: 600;
    color: #5a5a5a;
    letter-spacing: 0.02em;
}

.campo input {
    border: 1px solid #d0d0d0;
    padding: 9px 12px;
    font-family: inherit;
    font-size: 13.5px;
    color: #1a1a1a;
    background: #fff;
    outline: none;
    transition: border-color 0.1s;
}

.campo input:focus {
    border-color: #1e40af;
}

.campo input::placeholder {
    color: #9a9a9a;
}

.campo input.erro {
    border-color: #dc2626;
}

.msg-erro {
    font-size: 11.5px;
    color: #dc2626;
    margin-top: 2px;
}

.link-esqueceu {
    font-size: 12px;
    color: #1e40af;
    cursor: pointer;
    text-align: right;
    margin-top: -6px;
    margin-bottom: 22px;
}

.link-esqueceu:hover {
    text-decoration: underline;
}

.botao-entrar {
    width: 100%;
    padding: 10px;
    background: #1a1a1a;
    color: #fff;
    border: none;
    font-family: inherit;
    font-size: 13.5px;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.1s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
}

.botao-entrar:hover {
    background: #333;
}

.botao-entrar.carregando {
    opacity: 0.7;
    pointer-events: none;
}

.spinner {
    width: 14px;
    height: 14px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top-color: #fff;
    border-radius: 50%;
    animation: girar 0.6s linear infinite;
    display: block;
}

@keyframes girar {
    to {
        transform: rotate(360deg);
    }
}

.painel-direito {
    flex: 1;
    background: #f8f8f8;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.painel-direito-inner {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 48px;
    gap: 32px;
}

.tagline {
    font-size: 13px;
    color: #5a5a5a;
    text-align: center;
    max-width: 320px;
    line-height: 1.6;
}

.tagline strong {
    color: #1a1a1a;
    font-weight: 600;
}

.grid-stats {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1px;
    background: #e0e0e0;
    border: 1px solid #e0e0e0;
    width: 100%;
    max-width: 420px;
}

.stat-card {
    background: #fff;
    padding: 18px 20px;
}

.stat-rotulo {
    font-size: 10px;
    font-weight: 600;
    color: #9a9a9a;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    margin-bottom: 6px;
}

.stat-valor {
    font-size: 22px;
    font-weight: 600;
    letter-spacing: -0.8px;
    font-family: ui-monospace, monospace;
}

.stat-sub {
    font-size: 11px;
    color: #9a9a9a;
    margin-top: 3px;
}

.stat-alerta .stat-valor {
    color: #92400e;
}

.preview-estoque {
    background: #fff;
    border: 1px solid #e0e0e0;
    width: 100%;
    max-width: 420px;
    overflow: hidden;
}

.preview-cabecalho {
    padding: 10px 14px;
    border-bottom: 1px solid #e0e0e0;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.preview-titulo {
    font-size: 11.5px;
    font-weight: 600;
}

.preview-badge {
    font-size: 10px;
    font-weight: 600;
    background: #fef2f2;
    color: #991b1b;
    padding: 2px 7px;
}

.preview-linha {
    display: flex;
    align-items: center;
    padding: 8px 14px;
    gap: 10px;
    border-bottom: 1px solid #e0e0e0;
    font-size: 12.5px;
}

.preview-linha:last-child {
    border-bottom: none;
}

.ponto-status {
    width: 5px;
    height: 5px;
    flex-shrink: 0;
}

.ponto-critico {
    background: #dc2626;
}

.ponto-alerta-cor {
    background: #d97706;
}

.item-nome {
    font-weight: 500;
    flex: 1;
}

.item-qtd {
    font-family: ui-monospace, monospace;
    font-size: 11px;
    font-weight: 500;
}

.qtd-critico {
    color: #991b1b;
}

.qtd-alerta {
    color: #92400e;
}

.item-min {
    font-family: ui-monospace, monospace;
    font-size: 11px;
    color: #9a9a9a;
}
</style>
