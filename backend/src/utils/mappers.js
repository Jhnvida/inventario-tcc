function statusEstoque(estoque, minimo) {
    if (estoque >= minimo) return "ok";
    if (minimo > 0 && estoque / minimo >= 0.4) return "alerta";
    return "critico";
}

function toProduto(row) {
    return {
        id: row.id,
        nome: row.nome,
        sku: row.sku,
        categoriaId: row.categoria_id,
        categoria: row.categoria,
        local: row.localizacao,
        estoque: Number(row.estoque),
        minimo: Number(row.minimo),
        preco: Number(row.preco),
        status: statusEstoque(Number(row.estoque), Number(row.minimo)),
    };
}

function toFornecedor(row) {
    const ativo = Boolean(row.ativo);
    return {
        id: row.id,
        razaoSocial: row.razao_social,
        nomeFantasia: row.nome_fantasia,
        cnpj: row.cnpj,
        contato: row.contato,
        telefone: row.telefone,
        prazoMedio: Number(row.prazo_medio || 0),
        ativo,
        status: ativo ? "ok" : "inativo",
    };
}

module.exports = { statusEstoque, toProduto, toFornecedor };
