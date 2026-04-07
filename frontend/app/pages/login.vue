<script setup lang="ts">
import type { ResumoDashboard } from "~/types";
definePageMeta({ layout: "auth" });

const { data } = useFetch<ResumoDashboard>("/api/dashboard");
</script>

<template>
    <div class="login-wrap">
        <div class="painel-esquerdo">
            <div class="logo-topo">
                <span class="logo-nome">Inventário</span>
            </div>

            <div class="area-formulario">
                <h1 class="titulo-login">Bem-vindo de volta</h1>
                <h2 class="subtitulo-login">Entre com sua conta para acessar o painel.</h2>

                <form @submit.prevent>
                    <div class="campo">
                        <label for="email">E-mail</label>
                        <input id="email" type="email" placeholder="voce@empresa.com.br" autocomplete="email" />
                    </div>

                    <div class="campo">
                        <label for="senha">Senha</label>
                        <input id="senha" type="password" placeholder="••••••••" autocomplete="current-password" />
                    </div>

                    <div class="link-esqueceu">Esqueceu a senha?</div>

                    <button type="submit" class="botao-entrar">Entrar</button>
                </form>
            </div>
        </div>

        <div class="painel-direito">
            <div class="painel-direito-inner">
                <p class="tagline">
                    Controle total do seu estoque.<br />
                    <strong>Precisão em cada operação.</strong>
                </p>

                <div v-if="data" class="grid-stats">
                    <div class="stat-card">
                        <div class="stat-rotulo">Valor Total</div>
                        <div class="stat-valor">{{ formatarMoeda(Number(data.valor_total)) }}</div>
                    </div>

                    <div class="stat-card">
                        <div class="stat-rotulo">Produtos</div>
                        <div class="stat-valor">{{ data.total_produtos }}</div>
                    </div>

                    <div class="stat-card" :class="{ 'stat-alerta': data.em_alerta > 0 }">
                        <div class="stat-rotulo">Em Alerta</div>
                        <div class="stat-valor">{{ data.em_alerta }}</div>
                    </div>

                    <div class="stat-card">
                        <div class="stat-rotulo">Pedidos</div>
                        <div class="stat-valor">{{ data.pedidos_abertos }}</div>
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

.stat-alerta .stat-valor {
    color: #92400e;
}
</style>
