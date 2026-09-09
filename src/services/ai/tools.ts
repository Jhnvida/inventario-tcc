import { Type, type Tool } from "@google/genai";

export const tools: Tool[] = [
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
            {
                name: "analisar_movimentacao",
                description:
                    "Realiza um cálculo estatístico do consumo médio de um produto específico com base no seu histórico de saídas e estima os dias até a ruptura do estoque.",
                parameters: {
                    type: Type.OBJECT,
                    properties: {
                        produto_id: {
                            type: Type.STRING,
                            description: "O ID do produto a ser analisado. Obrigatório.",
                        },
                        dias_historico: {
                            type: Type.NUMBER,
                            description:
                                "Opcional. Quantidade de dias de histórico para basear o cálculo (ex: 7, 30, 60, 90). Padrão é 30 dias.",
                        },
                    },
                    required: ["produto_id"],
                },
            },
        ],
    },
];
