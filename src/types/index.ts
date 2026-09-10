export interface Categoria {
    id: string;
    nome: string;
    criado_em: string;
}

export interface Produto {
    id: string;
    nome: string;
    sku: string;
    categoria_id?: string | null;
    localizacao?: string | null;
    quantidade: number;
    estoque_minimo: number;
    preco: number;
    criado_em?: string;
    atualizado_em?: string;
}

export interface Movimentacao {
    id: string;
    produto_id: string;
    tipo: "entrada" | "saida";
    quantidade: number;
    usuario_id?: string | null;
    motivo: string | null;
    criada_em: string;
    produtos?: { nome: string; sku: string };
    usuarios?: { nome: string; email: string } | null;
}

export interface Fornecedor {
    id: string;
    razao_social: string;
    nome_fantasia?: string | null;
    cnpj: string;
    telefone?: string | null;
    email?: string | null;
    criado_em: string;
}

export interface Pedido {
    id: string;
    fornecedor_id: string;
    status: "rascunho" | "enviado" | "concluido" | "cancelado";
    valor_total: number;
    criado_em: string;
    atualizado_em: string;
}

export interface ItemPedido {
    id: string;
    pedido_id: string;
    produto_id: string;
    quantidade: number;
    preco_unitario: number;
}

export interface DashboardMetricas {
    valorTotal: number;
    totalProdutos: number;
    estoqueCritico: number;
    pedidosAbertos: number;
}
