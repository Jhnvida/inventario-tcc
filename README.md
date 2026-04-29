# Inventario TCC

Sistema de gerenciamento de estoque para TCC com frontend em Nuxt e backend em Express conectado ao Postgres do Supabase.

## Visao geral

- Dashboard com resumo de produtos, alertas e movimentacoes recentes.
- Gestao de produtos e fornecedores com CRUD.
- Pedidos de compra com itens, edicao e exclusao.
- Movimentacoes de estoque com ajuste de saldo e historico.
- Navegacao por paginas dedicadas (sem painel lateral de formulario).

## Stack

- `Frontend`: Nuxt 4, Vue 3, TypeScript, Tailwind CSS
- `Backend`: Express, PostgreSQL (`pg`)
- `Banco`: Supabase (Postgres)
- `Outros`: `dotenv`, `cors`

## Requisitos

- Node.js 20+ (recomendado)
- Projeto Supabase com banco Postgres ativo
- npm (ou outro gerenciador compativel)

## Instalacao

```bash
# Backend
cd backend
npm install
cp .env.example .env
# edite DATABASE_URL no .env com sua credencial Supabase

# Frontend
cd frontend
npm install
```

## Banco (Supabase)

Configure `DATABASE_URL` em `backend/.env` e aplique o esquema:

```bash
cd backend
npm run db:setup
```

O esquema usado esta em `backend/sql/esquema.sql` (espelho de `/home/john/Downloads/esquema.sql`).

## Desenvolvimento

Inicie os dois servicos em terminais separados:

```bash
# API em http://localhost:3001
cd backend
npm run dev

# App em http://localhost:3000
cd frontend
npm run dev
```

## Build e preview (frontend)

Gerar build de producao:

```bash
cd frontend
npm run build
```

Visualizar build localmente:

```bash
cd frontend
npm run preview
```

Gerar versao estatica:

```bash
cd frontend
npm run generate
```

## Scripts disponiveis

### Backend

- `npm run dev`: API em desenvolvimento com watch
- `npm run start`: API em modo normal
- `npm run db:setup`: aplica schema e seed inicial

### Frontend

- `npm run dev`: ambiente de desenvolvimento
- `npm run build`: build de producao
- `npm run preview`: preview da build
- `npm run generate`: geracao estatica

## Endpoints principais

- `GET /health`
- `GET /dashboard`
- `GET /categorias`
- `GET /usuarios`
- `GET /movimentacoes`, `GET /movimentacoes/:id`, `POST /movimentacoes`, `PUT /movimentacoes/:id`, `DELETE /movimentacoes/:id`
- `GET /pedidos`, `GET /pedidos/:id`, `POST /pedidos`, `PUT /pedidos/:id`, `DELETE /pedidos/:id`
- `GET /produtos`, `POST /produtos`, `PUT /produtos/:id`, `DELETE /produtos/:id`
- `GET /fornecedores`, `POST /fornecedores`, `PUT /fornecedores/:id`, `DELETE /fornecedores/:id`

## Observacoes

- As operacoes de movimentacao atualizam estoque automaticamente.
- Ao editar/excluir movimentacoes, o saldo do produto e recalculado com validacao.
- A autenticacao ainda esta em fluxo simplificado para foco no TCC.
