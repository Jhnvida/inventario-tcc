export const tools = [
    {
        type: "function",
        function: {
            name: "consultar_produtos",
            description:
                "Consulta a lista de produtos no estoque. Pode filtrar para ver apenas estoque baixo ou zerado.",
            parameters: {
                type: "object",
                properties: {
                    filtro_estoque: {
                        type: "string",
                        description: "Filtro opcional. Valores aceitos: 'todos', 'baixo', 'zerado'.",
                    },
                },
            },
        },
    },
    {
        type: "function",
        function: {
            name: "consultar_resumo_estoque",
            description:
                "Retorna o total de produtos únicos, total de itens em quantidade e quantos estão com estoque baixo/crítico.",
            parameters: {
                type: "object",
                properties: {},
            },
        },
    },
    {
        type: "function",
        function: {
            name: "consultar_categorias",
            description: "Retorna a lista de categorias do sistema.",
            parameters: {
                type: "object",
                properties: {},
            },
        },
    },
    {
        type: "function",
        function: {
            name: "consultar_fornecedores",
            description: "Retorna a lista de fornecedores cadastrados.",
            parameters: {
                type: "object",
                properties: {},
            },
        },
    },
];
