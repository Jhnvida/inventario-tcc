export type StatusEstoque = "ok" | "alerta" | "critico" | "info" | "inativo";
export type StatusFornecedor = "ok" | "inativo";
export type StatusPedido = "rascunho" | "aberto" | "parcial" | "concluido" | "cancelado";
export type TipoMovimentacao = "entrada" | "saida";

export interface Produto {
  id: number;
  nome: string;
  sku: string;
  categoria: string;
  local: string;
  estoque: number;
  minimo: number;
  preco: number;
  status: StatusEstoque;
}

export interface Fornecedor {
  id: number;
  razaoSocial: string;
  nomeFantasia: string;
  cnpj: string;
  contato: string;
  prazoMedio: number;
  status: StatusFornecedor;
}

export interface Pedido {
  id: number;
  numero: string;
  fornecedor: string;
  itens: number;
  valor: number;
  status: StatusPedido;
  previsao: string;
  data: string;
}

export interface Movimentacao {
  id: number;
  tipo: TipoMovimentacao;
  produto: string;
  sku: string;
  quantidade: number;
  responsavel: string;
  observacao?: string;
  data: string;
}
