const db = require("../config/db");

async function listar(req, res) {
  try {
    const resultado = await db.query("SELECT * FROM categorias ORDER BY nome ASC");
    res.json(resultado.rows);
  } catch (erro) {
    res.status(500).json({ erro: "Erro ao listar categorias", detalhe: erro.message });
  }
}

module.exports = { listar };
