export const tools = [
    {
        type: "function",
        function: {
            name: "consultar_produtos",
            description:
                "Consulta a lista de produtos no estoque. Pode buscar por termo (nome/SKU) e filtrar para ver apenas estoque baixo ou zerado. Sempre retorna a localização do produto.",
            parameters: {
                type: "object",
                properties: {
                    termo_busca: {
                        type: "string",
                        description: "Termo de busca opcional para procurar produtos específicos por nome ou SKU.",
                    },
                    filtro_estoque: {
                        type: "string",
                        description: "Filtro opcional. Valores aceitos: 'todos', 'baixo', 'zerado'.",
                    },
                    ordenacao: {
                        type: "string",
                        description:
                            "Opcional. Valores aceitos: 'quantidade_desc' (maior quantidade) ou 'quantidade_asc' (menor quantidade).",
                    },
                    limite: {
                        type: "number",
                        description: "Opcional. Limite de produtos a retornar (ex: 5 para os top 5).",
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
                "Retorna métricas gerais do sistema: total de produtos únicos, total de itens em quantidade, valor total financeiro e quantos produtos estão com estoque baixo/crítico.",
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
            description: "Retorna a lista de categorias cadastradas no sistema.",
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
            description:
                "Retorna a lista de fornecedores cadastrados, com suas informações de Razão Social e Nome Fantasia.",
            parameters: {
                type: "object",
                properties: {},
            },
        },
    },
    {
        type: "function",
        function: {
            name: "consultar_movimentacoes",
            description: "Consulta o histórico de movimentações (entradas e saídas) dos produtos no estoque.",
            parameters: {
                type: "object",
                properties: {
                    tipo: {
                        type: "string",
                        description: "Opcional. Valores aceitos: 'entrada' ou 'saida'. Filtra o tipo de movimentação.",
                    },
                    data_inicio: {
                        type: "string",
                        description: "Opcional. Data inicial no formato YYYY-MM-DD.",
                    },
                    data_fim: {
                        type: "string",
                        description: "Opcional. Data final no formato YYYY-MM-DD.",
                    },
                    limite: {
                        type: "number",
                        description:
                            "Opcional. Limite de registros a retornar (padrão: 5). Use para não sobrecarregar a consulta.",
                    },
                },
            },
        },
    },
    {
        type: "function",
        function: {
            name: "consultar_ranking_movimentacoes",
            description:
                "Agrega as movimentações para encontrar os produtos com MAIOR quantidade movimentada (mais saídas ou mais entradas) em um período.",
            parameters: {
                type: "object",
                properties: {
                    tipo: {
                        type: "string",
                        description: "Obrigatório. 'entrada' ou 'saida'.",
                    },
                    data_inicio: {
                        type: "string",
                        description: "Opcional. Data inicial no formato YYYY-MM-DD.",
                    },
                    data_fim: {
                        type: "string",
                        description: "Opcional. Data final no formato YYYY-MM-DD.",
                    },
                    limite: {
                        type: "number",
                        description: "Opcional. Top N produtos a retornar (padrão: 5).",
                    },
                },
                required: ["tipo"],
            },
        },
    },
    {
        type: "function",
        function: {
            name: "consultar_pedidos",
            description: "Consulta o status e o valor dos pedidos de reposição junto aos fornecedores.",
            parameters: {
                type: "object",
                properties: {
                    status: {
                        type: "string",
                        description: "Opcional. Valores aceitos: 'Pendente', 'Concluído', 'Cancelado'.",
                    },
                    limite: {
                        type: "number",
                        description: "Opcional. Limite de registros a retornar (padrão: 5).",
                    },
                },
            },
        },
    },
];
