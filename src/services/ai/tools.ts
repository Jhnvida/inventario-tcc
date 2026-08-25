import { Type } from "@google/genai";

export const tools = [
    {
        functionDeclarations: [
            {
                name: "consultar_produtos",
                description:
                    "Consulta a lista de produtos no estoque. Pode filtrar para ver apenas estoque baixo ou zerado.",
                parameters: {
                    type: Type.OBJECT,
                    properties: {
                        filtro_estoque: {
                            type: Type.STRING,
                            description: "Filtro opcional. Valores aceitos: 'todos', 'baixo', 'zerado'.",
                        },
                    },
                },
            },
            {
                name: "consultar_resumo_estoque",
                description:
                    "Retorna o total de produtos únicos, total de itens em quantidade e quantos estão com estoque baixo/crítico.",
            },
            {
                name: "consultar_categorias",
                description: "Retorna a lista de categorias do sistema.",
            },
            {
                name: "consultar_fornecedores",
                description: "Retorna a lista de fornecedores cadastrados.",
            },
        ],
    },
];
