const db = require("../config/db");

async function listar(req, res) {
  try {
    const resultado = await db.query(
      `SELECT
         p.id, p.nome, p.sku,
         c.nome AS categoria,
         p.localizacao AS local,
         p.estoque, p.minimo, p.preco,
         p.criado_em, p.atualizado_em
       FROM produtos p
       LEFT JOIN categorias c ON c.id = p.categoria_id
       ORDER BY p.nome ASC`,
    );

    res.json(resultado.rows);
  } catch (erro) {
    res.status(500).json({ erro: "Erro ao listar produtos", detalhe: erro.message });
  }
}

module.exports = { listar };
