const db = require("../config/db");

async function listar(req, res) {
  try {
    const resultado = await db.query(
      `SELECT
        m.*,
        p.nome produto_nome,
        p.sku produto_sku,
        u.nome responsavel_nome
       FROM movimentacoes m
       LEFT JOIN produtos p ON p.id = m.produto_id
       LEFT JOIN usuarios u ON u.id = m.responsavel_id
       ORDER BY m.criado_em DESC`,
    );

    res.json(resultado.rows);
  } catch (erro) {
    res.status(500).json({ erro: "Erro ao listar movimentações", detalhe: erro.message });
  }
}

module.exports = { listar };
