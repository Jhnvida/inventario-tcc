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
         COUNT(ip.id) AS itens,
         COALESCE(SUM(ip.quantidade * ip.preco_unitario), 0) AS valor
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

async function detalhar(req, res) {
  try {
    const resultadoPedido = await db.query(
      `SELECT
         p.id,
         p.numero,
         COALESCE(f.nome_fantasia, f.razao_social) AS fornecedor,
         p.status,
         p.previsao,
         p.criado_em AS data,
         p.observacoes,
         p.recebido_em
       FROM pedidos p
       LEFT JOIN fornecedores f ON f.id = p.fornecedor_id
       WHERE p.id = $1`,
      [req.params.id],
    );

    if (resultadoPedido.rows.length === 0) return res.status(404).json({ erro: "Pedido não encontrado" });

    const resultadoItens = await db.query(
      `SELECT
         ip.id,
         ip.quantidade,
         ip.preco_unitario,
         pr.nome AS produto,
         pr.sku
       FROM itens_pedido ip
       LEFT JOIN produtos pr ON pr.id = ip.produto_id
       WHERE ip.pedido_id = $1`,
      [req.params.id],
    );

    res.json({ ...resultadoPedido.rows[0], itens: resultadoItens.rows });
  } catch (erro) {
    res.status(500).json({ erro: "Erro ao buscar pedido", detalhe: erro.message });
  }
}

module.exports = { listar, detalhar };
