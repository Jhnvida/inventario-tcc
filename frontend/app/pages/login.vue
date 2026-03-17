<script setup lang="ts">
definePageMeta({ layout: "auth" });

const itensAlerta = [
    { nome: "Headset USB HX100", estoque: 1, minimo: 12 },
    { nome: "Mouse Sem Fio M320", estoque: 2, minimo: 10 },
    { nome: "Teclado Mecânico TK200", estoque: 7, minimo: 15 },
    { nome: "Cabo HDMI 2.0 2m", estoque: 4, minimo: 20 },
    { nome: 'Monitor 24" Full HD', estoque: 3, minimo: 8 },
];
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
                        <div class="ponto" :class="`ponto-${statusEstoque(item.estoque, item.minimo)}`" />
                        <div class="item-nome">{{ item.nome }}</div>
                        <div class="item-qtd" :class="`qtd-${statusEstoque(item.estoque, item.minimo)}`">{{ item.estoque }} un</div>
                        <div class="item-min">mín {{ item.minimo }}</div>
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
