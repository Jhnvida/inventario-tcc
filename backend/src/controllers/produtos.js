const db = require("../config/db");

async function listar(req, res) {
  try {
    const resultado = await db.query(
      `SELECT p.*, c.nome categoria_nome
       FROM produtos p
       LEFT JOIN categorias c ON c.id = p.categoria_id
       ORDER BY p.nome ASC`,
    );

    res.json(resultado.rows);
  } catch (erro) {
    res.status(500).json({ erro: "Erro ao listar produtos", detalhe: erro.message });
  }
}

async function detalhar(req, res) {
  try {
    const resultado = await db.query(
      `SELECT p.*, c.nome categoria_nome
       FROM produtos p
       LEFT JOIN categorias c ON c.id = p.categoria_id
       WHERE p.id = $1`,
      [req.params.id],
    );

    if (resultado.rows.length === 0) return res.status(404).json({ erro: "Produto não encontrado" });
    res.json(resultado.rows[0]);
  } catch (erro) {
    res.status(500).json({ erro: "Erro ao buscar produto", detalhe: erro.message });
  }
}

module.exports = { listar, detalhar };
