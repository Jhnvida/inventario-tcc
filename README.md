# Inventário Inteligente — Gestão de Estoque com IA Local

Sistema completo de gestão de inventário, controle de movimentações e pedidos de compra e venda, integrando uma arquitetura _Backend-as-a-Service_ (BaaS) com Supabase e um assistente conversacional inteligente executado localmente via **Ollama** com suporte a _Function Calling_.

---

[![React 19](https://img.shields.io/badge/React-19.2-61DAFB?style=flat&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.2-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4.3-06B6D4?style=flat&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-BaaS-3FCF8E?style=flat&logo=supabase&logoColor=white)](https://supabase.com/)
[![Ollama](https://img.shields.io/badge/Ollama-Llama_3.2-black?style=flat&logo=ollama&logoColor=white)](https://ollama.com/)
[![Node.js Tests](https://img.shields.io/badge/Tests-Node_Native-green?style=flat&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Licença Privada](https://img.shields.io/badge/License-Privado-lightgrey?style=flat)](#licença)

---

## Sumário

- [Visão Geral](#visão-geral)
- [Funcionalidades Principais](#funcionalidades-principais)
- [Arquitetura do Assistente de IA](#arquitetura-do-assistente-de-ia)
- [Tecnologias Utilizadas](#tecnologias-utilizadas)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Pré-requisitos](#pré-requisitos)
- [Variáveis de Ambiente](#variáveis-de-ambiente)
- [Instalação e Execução](#instalação-e-execução)
- [Executando os Testes](#executando-os-testes)
- [Scripts Disponíveis](#scripts-disponíveis)
- [Módulos e Navegação](#módulos-e-navegação)
- [Padrões de Versionamento](#padrões-de-versionamento)
- [Licença](#licença)

---

## Visão Geral

O **Inventário Inteligente** foi concebido para resolver desafios de controle operacional em estoques físicos, unificando catalogação, rastreabilidade de entradas e saídas, gestão de compras e faturamento de vendas.

O diferencial do sistema está na convergência entre a integridade transacional — garantida diretamente no banco de dados via Stored Procedures (RPCs) no PostgreSQL do Supabase — e uma interface de apoio à tomada de decisão assistida por Inteligência Artificial. Utilizando o Ollama com o modelo Llama 3.2 em execução local, o operador pode consultar métricas, alertas de ruptura e análises da curva ABC em linguagem natural com garantia determinística via chamadas de função (_Function Calling_).

---

## Funcionalidades Principais

- **Painel de Controle em Tempo Real (Dashboard):** Visão executiva consolidada com métricas de valor patrimonial total, volume de itens em estoque, alertas de estoque crítico, pedidos pendentes e tabela dinâmica de movimentações recentes.
- **Catálogo Geral de Produtos:** Gestão completa (CRUD) com SKU, código de barras, localização física no almoxarifado, custo unitário, quantidade atual e limite de segurança (estoque mínimo).
- **Rastreabilidade e Movimentações:** Auditoria de entradas e saídas de estoque, registrando tipo de movimentação, quantidade, justificativa, data/hora e identificação do usuário logado.
- **Gestão de Pedidos de Compra:** Emissão e controle de pedidos vinculados a fornecedores parceiros, com cálculo automático e fluxo atômico de recebimento de mercadorias.
- **Gestão de Pedidos de Venda:** Registro de pedidos e orçamentos para clientes com baixa automática no estoque físico e geração da respectiva movimentação de saída.
- **Cadastros Auxiliares:** Módulos dedicados para Fornecedores (com CNPJ, razão social e canais de contato), Clientes (PF e PJ), Categorias de Materiais e Usuários com controle de perfil.
- **Assistente Local com IA:** Interface conversacional com sugestões rápidas, histórico e ferramentas mapeadas para consulta analítica em linguagem natural.
- **Controle de Acesso Seguro:** Autenticação gerenciada via Supabase Auth com rotas protegidas e isolamento de sessão.

---

## Arquitetura do Assistente de IA

O módulo de IA opera de forma local e privada através do Ollama, garantindo que os dados corporativos não trafeguem por APIs de terceiros:

1. **Camada de Escopo e Guardrails:** Sanitiza as mensagens recebidas, impedindo tentativas de jailbreak e direcionando exclusivamente para o escopo de inventário.
2. **Declaração de Ferramentas (Function Calling):** Mapeamento formal de funções de consulta (`consultar_produtos`, `consultar_resumo_estoque`, `consultar_movimentacoes`, `consultar_curva_abc`, `analisar_previsao_ruptura`, `consultar_pedidos`, `consultar_pedidos_venda`).
3. **Execução Determinística:** O modelo identifica a intenção e os parâmetros, delega a execução para os manipuladores internos do Supabase e formata a resposta final com clareza via Markdown.

---

## Tecnologias Utilizadas

### Frontend

- **[React 19](https://react.dev/):** Biblioteca declarativa com suporte nativo ao React Compiler para máxima performance.
- **[TypeScript](https://www.typescriptlang.org/):** Tipagem estática fim a fim em componentes, hooks e contratos de API.
- **[Vite 8](https://vitejs.dev/):** Ferramenta de build de última geração com inicialização instantânea.
- **[React Router DOM 7](https://reactrouter.com/):** Gerenciamento de rotas declarativas e guards de autenticação.
- **[Tailwind CSS v4](https://tailwindcss.com/):** Motor de estilização atômica de alta performance integrado ao Vite.
- **[GSAP](https://greensock.com/gsap/):** Biblioteca para animações fluidas, transições de interface e microinterações.
- **[Lucide React](https://lucide.dev/):** Ícones modernos e consistentes.
- **[React Markdown](https://github.com/remarkjs/react-markdown):** Renderização segura de Markdown gerado pelo assistente de IA.

### Backend & Serviços

- **[Supabase](https://supabase.com/):** Plataforma de backend com PostgreSQL, Supabase Auth para gestão de sessões e Stored Procedures RPCs para operações com integridade transacional (`registrar_movimentacao`, `receber_pedido`).

### Inteligência Artificial

- **[Ollama](https://ollama.com/):** Runtime para execução de modelos de linguagem (Llama 3.2:3b) localmente no dispositivo via API HTTP.

### Testes & Qualidade

- **Node.js Native Test Runner:** Testes automatizados executados com `node --test --experimental-strip-types`.
- **[Oxlint](https://oxc.rs/):** Análise estática ultrarrápida para código TypeScript e componentes React.
- **[Stylelint](https://stylelint.io/):** Padronização e validação das regras de folhas de estilo CSS.

---

## Estrutura do Projeto

```text
inventario-tcc/
├── public/                 # Favicons e manifestos estáticos
├── src/
│   ├── assets/             # Recursos visuais e logotipos
│   ├── components/         # Componentes reutilizáveis (Button, Modal, Input, Layout, etc.)
│   ├── contexts/           # Provedores de contexto (AuthContext)
│   ├── hooks/              # Hooks customizados (useProdutos, usePedidos, useDashboard, etc.)
│   ├── lib/                # Configuração de clientes de API (Supabase)
│   ├── pages/              # Telas da aplicação (Dashboard, Produtos, Movimentações, etc.)
│   ├── services/           # Lógica de integração e ferramentas da IA (services/ai)
│   ├── styles/             # Estilos globais e tokens de tema
│   ├── tests/              # Testes unitários e de integração das ferramentas de IA
│   ├── types/              # Definições de tipos TypeScript
│   ├── utils/              # Formatadores de moeda, datas e tratamento de erros
│   ├── App.tsx             # Configuração do roteador e provedores
│   └── main.tsx            # Ponto de entrada da aplicação
├── .env.example            # Modelo de variáveis de ambiente
├── .oxlintrc.json          # Configuração do Oxlint
├── .stylelintrc.json       # Configuração do Stylelint
├── package.json            # Dependências e scripts do projeto
├── tsconfig.json           # Configurações do compilador TypeScript
└── vite.config.ts          # Configurações do Vite e Tailwind v4
```

---

## Pré-requisitos

Certifique-se de ter os seguintes softwares instalados em seu ambiente:

- [Node.js](https://nodejs.org/) (versão 20.0.0 ou superior recomendada)
- [npm](https://www.npmjs.com/) (gerenciador de pacotes padrão)
- Uma conta no [Supabase](https://supabase.com/) com projeto e tabelas provisionadas
- [Ollama](https://ollama.com/) instalado para as consultas inteligentes

---

## Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto copiando o modelo de `.env.example`:

```bash
cp .env.example .env
```

Preencha as variáveis de acordo com as credenciais do seu projeto Supabase:

| Variável                        | Descrição                         | Exemplo                           |
| ------------------------------- | --------------------------------- | --------------------------------- |
| `VITE_SUPABASE_URL`             | URL do projeto Supabase           | `https://seu-projeto.supabase.co` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Chave pública anônima do Supabase | `sua_chave_publica_aqui`          |

---

## Instalação e Execução

1. **Clone o repositório:**

    ```bash
    git clone https://github.com/Jhnvida/inventario-tcc.git
    cd inventario-tcc
    ```

2. **Instale as dependências:**

    ```bash
    npm install
    ```

3. **Inicie o modelo no Ollama (em um terminal separado):**

    ```bash
    ollama run llama3.2:3b
    ```

4. **Inicie a aplicação em desenvolvimento:**

    ```bash
    npm run dev
    ```

5. **Acesse no navegador:**
   Abra [http://localhost:5173](http://localhost:5173).

---

## Executando os Testes

A aplicação utiliza o test runner nativo do Node.js com execução direta de arquivos TypeScript:

```bash
npm test
```

A suíte cobre:

- Guardrails e camadas de sanitização contra tentativas de manipulação da IA.
- Formatadores de data e localização para pt-BR.
- Mapeamento e execução segura de manipuladores de ferramentas (_Tool Handlers_).

---

## Scripts Disponíveis

| Comando                | Descrição                                                                          |
| ---------------------- | ---------------------------------------------------------------------------------- |
| `npm run dev`          | Inicia o servidor Vite de desenvolvimento com HMR.                                 |
| `npm run build`        | Checagem de tipos (`tsc -b`) e compilação dos ativos de produção na pasta `dist/`. |
| `npm test`             | Executa a suíte completa de testes automatizados com o Node.js Test Runner.        |
| `npm run lint`         | Valida as regras de lint do código via Oxlint.                                     |
| `npm run lint:css`     | Verifica a conformidade das regras CSS via Stylelint.                              |
| `npm run lint:css:fix` | Aplica correções automáticas nas regras de estilo.                                 |
| `npm run preview`      | Inicia um servidor HTTP local para inspeção do build de produção.                  |

---

## Módulos e Navegação

| Rota             | Módulo             | Descrição                                                                         |
| ---------------- | ------------------ | --------------------------------------------------------------------------------- |
| `/login`         | Autenticação       | Formulário de acesso ao sistema com credenciais Supabase Auth.                    |
| `/`              | Dashboard          | Métricas principais, valor em estoque, alertas de ruptura e histórico recente.    |
| `/produtos`      | Gestão de Produtos | Catálogo completo com busca, filtros por categoria e controle de estoque mínimo.  |
| `/movimentacoes` | Movimentações      | Entradas e saídas de estoque com registro auditável e histórico com filtros.      |
| `/pedidos`       | Pedidos de Compra  | Emissão e acompanhamento de compras com recebimento atômico de mercadorias.       |
| `/pedidos-venda` | Pedidos de Venda   | Registro de orçamentos e pedidos com baixa automática no estoque físico.          |
| `/clientes`      | Clientes           | Cadastro e acompanhamento de clientes (PF e PJ) com formatação de documentos.     |
| `/fornecedores`  | Fornecedores       | Cadastro e consulta de fornecedores parceiros com CNPJ e contatos.                |
| `/categorias`    | Categorias         | Organização e taxonomia dos produtos cadastrados.                                 |
| `/usuarios`      | Usuários           | Administração de operadores com controle de acessos.                              |
| `/assistente`    | Assistente IA      | Interface de chat para consultas determinísticas em linguagem natural via Ollama. |

---

## Padrões de Versionamento

Este repositório adota a convenção de [Conventional Commits](https://www.conventionalcommits.org/pt-br/):

- `feat:` Novas funcionalidades no sistema ou ferramentas do assistente.
- `fix:` Correções de bugs em regras de negócio ou interface.
- `docs:` Alterações e melhorias na documentação técnica.
- `style:` Ajustes puramente visuais ou de formatação sem impacto comportamental.
- `refactor:` Refatorações de código e reorganização estrutural.
- `perf:` Melhorias diretas de performance e tempo de resposta.
- `test:` Inclusão ou manutenção de testes automatizados.
- `build:` Modificações nas dependências ou configurações de empacotamento.
- `chore:` Tarefas rotineiras de manutenção e infraestrutura.

---

## Licença

Este projeto foi desenvolvido como trabalho acadêmico (TCC) e aplicação privada. Não possui licença pública de código aberto concedida para reprodução comercial. Todos os direitos reservados ao autor.
