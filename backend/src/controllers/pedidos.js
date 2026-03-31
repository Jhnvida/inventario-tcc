const db = require("../config/db");

async function listar(req, res) {
  try {
    const resultado = await db.query(
      `SELECT
         p.id,
         p.numero,
         COALESCE(f.nome_fantasia, f.razao_social) AS fornecedor,
         p.status,
         p.previsao,
         p.criado_em AS data,
         COUNT(ip.id)::int AS itens,
         COALESCE(SUM(ip.quantidade * ip.preco_unitario), 0)::float8 AS valor
       FROM pedidos p
       LEFT JOIN fornecedores f ON f.id = p.fornecedor_id
       LEFT JOIN itens_pedido ip ON ip.pedido_id = p.id
       GROUP BY p.id, f.id
       ORDER BY p.criado_em DESC`,
    );

    res.json(resultado.rows);
  } catch (erro) {
    res.status(500).json({ erro: "Erro ao listar pedidos", detalhe: erro.message });
  }
}

module.exports = { listar };
