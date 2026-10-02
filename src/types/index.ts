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

export interface Cliente {
    id: string;
    nome: string;
    tipo_pessoa: "PF" | "PJ";
    documento?: string | null;
    email?: string | null;
    telefone?: string | null;
    cidade?: string | null;
    estado?: string | null;
    ativo: boolean;
    criado_em: string;
    atualizado_em?: string;
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

export interface PedidoVenda {
    id: string;
    numero?: number;
    cliente_id: string;
    usuario_id?: string | null;
    status: "rascunho" | "concluido" | "cancelado";
    valor_total: number;
    observacoes?: string | null;
    criado_em: string;
    atualizado_em: string;
}

export interface ItemPedidoVenda {
    id: string;
    pedido_venda_id: string;
    produto_id: string;
    quantidade: number;
    preco_unitario: number;
    subtotal?: number;
}

export interface DashboardMetricas {
    valorTotal: number;
    totalProdutos: number;
    estoqueCritico: number;
    pedidosAbertos: number;
}
