# Inventario TCC

Sistema de gerenciamento de estoque desenvolvido como TCC, com frontend em Nuxt e backend em Express.

## Visao geral

- Dashboard com resumo de produtos, alertas e movimentacoes recentes.
- Gestao de produtos e fornecedores com CRUD.
- Pedidos de compra com itens e consulta por ID.
- Movimentacoes de estoque para entrada e saida.

## Stack

- `Frontend`: Nuxt 4, Vue 3, TypeScript, Tailwind CSS
- `Backend`: Express, PostgreSQL (`pg`)
- `Outros`: `dotenv`, `cors`, `cookie-parser`

## Requisitos

- Node.js 20+ (recomendado)
- PostgreSQL em execucao
- npm (ou outro gerenciador compativel)

## Instalacao

```bash
# Backend
cd backend
npm install

# Frontend
cd frontend
npm install
```

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

## Endpoints principais (backend)

- `GET /dashboard`
- `GET /categorias`
- `GET /usuarios`
- `GET /movimentacoes`, `POST /movimentacoes`
- `GET /pedidos`, `GET /pedidos/:id`, `POST /pedidos`
- `GET /produtos`, `GET /produtos/:id`, `POST /produtos`, `PUT /produtos/:id`, `DELETE /produtos/:id`
- `GET /fornecedores`, `GET /fornecedores/:id`, `POST /fornecedores`, `PUT /fornecedores/:id`, `DELETE /fornecedores/:id`
