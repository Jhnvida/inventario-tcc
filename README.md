# Inventário Inteligente

Sistema web de gestão de inventário focado no controle de produtos, movimentações de estoque e pedidos de compra, aliado a uma interface de apoio à decisão baseada em inteligência artificial. O projeto adota uma arquitetura _Backend-as-a-Service_ (BaaS) com integridade transacional garantida diretamente no banco de dados e suporte à tomada de decisão através de um assistente local com _Function Calling_.

## Funcionalidades

- **Painel de Controle (Dashboard)**: Exibe indicadores em tempo real, incluindo valor total do estoque, total de itens cadastrados, alertas de estoque crítico e contagem de pedidos em aberto, além de tabelas com itens críticos e movimentações recentes.
- **Gestão de Produtos**: Catálogo completo com busca textual e filtros por categoria, exibindo SKU, localização física, preço unitário, quantidade atual e limite de estoque mínimo, além de formulários para cadastro, edição e exclusão.
- **Histórico de Movimentações**: Registro auditável de entradas e saídas de estoque com quantidade, motivo, data/hora e identificação do usuário responsável pela ação.
- **Pedidos de Compra**: Criação e acompanhamento de pedidos de reposição vinculados a fornecedores e produtos, com cálculo automático do total e fluxo transacional de recebimento com atualização atômica de estoque.
- **Cadastros de Apoio**: Gerenciamento de fornecedores (com razão social, nome fantasia, CNPJ, telefone e e-mail), categorias de materiais e usuários do sistema.
- **Assistente Inteligente (IA)**: Chat conversacional integrado ao Ollama (modelo Llama 3.2) utilizando _Function Calling_ para consultar métricas, verificar níveis de estoque, listar movimentações e analisar pedidos de forma determinística e sem alucinações.
- **Autenticação e Sessão**: Controle de acesso corporativo seguro com rotas privadas gerenciadas pelo Supabase Auth.

## Tecnologias Utilizadas

- **Frontend:**
    - [React 19](https://react.dev/) (com React Compiler)
    - [TypeScript](https://www.typescriptlang.org/)
    - [Vite](https://vitejs.dev/)
    - [React Router DOM](https://reactrouter.com/) para rotas
    - [Motion](https://motion.dev/) para animações e transições fluidas
    - [CSS Modules](https://github.com/css-modules/css-modules) para estilização
    - [Lucide React](https://lucide.dev/) para ícones
    - [React Markdown](https://github.com/remarkjs/react-markdown) e [Remark GFM](https://github.com/remarkjs/remark-gfm) para formatação das mensagens da IA
- **Backend & Serviços:**
    - [Supabase](https://supabase.com/) (Autenticação, Banco de Dados PostgreSQL e Stored Procedures via RPCs)
- **Inteligência Artificial:**
    - [Ollama](https://ollama.com/) (Execução local do modelo Llama 3.2 via API com suporte a chamadas de função)
- **Ferramentas de Desenvolvimento:**
    - [Oxlint](https://oxc.rs/) para análise estática e linting de código
    - [Stylelint](https://stylelint.io/) para padronização e linting de estilos CSS

## Estrutura do Projeto

A estrutura de pastas principal dentro de `src/` está organizada da seguinte forma:

- `/assets`: Recursos estáticos e imagens.
- `/components`: Componentes reutilizáveis de interface (`Button`, `Modal`, `Input`, `Card`, `Badge`, `Select`, `PageHeader`) e estruturais (`Layout`, `PrivateRoute`).
- `/contexts`: Contextos globais do React (ex: `AuthContext`).
- `/hooks`: Hooks customizados para regras de negócio e integração com o Supabase (`useProdutos`, `usePedidos`, `useMovimentacoes`, `useFornecedores`, `useCategorias`, `useUsuarios`, `useDashboard`, `useAssistente`).
- `/lib`: Configuração e inicialização de clientes externos (ex: cliente do Supabase).
- `/pages`: Telas da aplicação (`Dashboard`, `Produtos`, `Movimentacoes`, `Pedidos`, `Fornecedores`, `Categorias`, `Usuarios`, `Assistente` e `Login`).
- `/services`: Lógicas de integração e serviços especializados, contendo as definições de ferramentas, manipuladores e prompts da inteligência artificial (`services/ai`).
- `/styles`: Estilos globais, variáveis de tema e reset CSS.
- `/types`: Definições de tipos e interfaces do TypeScript para as entidades do sistema.
- `/utils`: Funções utilitárias para formatação de moeda, datas, documentos e tratamento de erros do banco.

## Pré-requisitos

Antes de iniciar, você precisará ter instalado em sua máquina:

- [Node.js](https://nodejs.org/en/) (recomendado versão 18 ou superior)
- Um gerenciador de pacotes como `npm`, `yarn` ou `pnpm`
- Uma conta no [Supabase](https://supabase.com/) com um projeto configurado (tabelas relacionais, autenticação e as funções RPC `registrar_movimentacao` e `receber_pedido`).
- [Ollama](https://ollama.com/) instalado e em execução na máquina para utilizar as funcionalidades do Assistente de IA.

## Instalação e Configuração

1. Clone o repositório:

    ```bash
    git clone <url-do-repositorio>
    ```

2. Acesse a pasta do projeto:

    ```bash
    cd inventario-tcc
    ```

3. Instale as dependências:

    ```bash
    npm install
    ```

4. Configure as variáveis de ambiente:
    - Crie um arquivo `.env` na raiz do projeto com base no arquivo `.env.example`:
        ```bash
        cp .env.example .env
        ```
    - Preencha o arquivo `.env` com as suas credenciais do Supabase:
        ```env
        VITE_SUPABASE_URL=https://seu-projeto.supabase.co
        VITE_SUPABASE_PUBLISHABLE_KEY=sua_chave_publica_do_supabase
        ```

5. Inicialize o modelo de linguagem no Ollama:

    ```bash
    ollama run llama3.2:3b
    ```

## Como Executar

Para iniciar o servidor de desenvolvimento, execute o comando:

```bash
npm run dev
```

Acesse a aplicação no seu navegador padrão (geralmente em `http://localhost:5173`).

## Como Usar

- **Login (`/login`)**: Página de autenticação corporativa com validação de credenciais via Supabase Auth.
- **Dashboard (`/`)**: Visão consolidada com cartões de métricas globais, lista de produtos com estoque em nível crítico e tabela de movimentações recentes.
- **Produtos (`/produtos`)**: Painel de gerenciamento do estoque físico com busca por nome ou SKU, filtro por categoria e formulário modal para cadastro e alteração de itens.
- **Movimentações (`/movimentacoes`)**: Tela para registro de entradas e saídas avulsas com motivo, além de tabela de histórico com filtros por tipo e produto.
- **Pedidos (`/pedidos`)**: Módulo para emissão de pedidos de compra com fornecedores e itens múltiplos, permitindo marcar pedidos como recebidos para atualizar o estoque de forma automática.
- **Fornecedores (`/fornecedores`)**: Cadastro e listagem de empresas parceiras com CNPJ, razão social, nome fantasia e canais de contato.
- **Categorias (`/categorias`)**: Cadastro e gerenciamento de agrupamentos para classificação dos produtos.
- **Usuários (`/usuarios`)**: Listagem de colaboradores com acesso ao sistema e edição de dados de perfil.
- **Assistente (`/assistente`)**: Interface conversacional com sugestões rápidas e biblioteca de comandos para consulta em linguagem natural sobre valores, alertas de estoque baixo e histórico de movimentações.
