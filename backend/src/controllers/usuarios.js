const db = require("../config/db");

async function listar(req, res) {
  try {
    const resultado = await db.query("SELECT id, nome, email, cargo, ativo, criado_em FROM usuarios ORDER BY nome ASC");
    res.json(resultado.rows);
  } catch (erro) {
    res.status(500).json({ erro: "Erro ao listar usuários", detalhe: erro.message });
  }
}

module.exports = { listar };
