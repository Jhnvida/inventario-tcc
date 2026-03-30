const db = require("../config/db");

async function listar(req, res) {
  try {
    const resultado = await db.query(
      `SELECT
         id,
         razao_social AS "razaoSocial",
         nome_fantasia AS "nomeFantasia",
         cnpj,
         contato,
         telefone,
         prazo_medio AS "prazoMedio",
         CASE WHEN ativo THEN 'ok' ELSE 'inativo' END AS status,
         criado_em
       FROM fornecedores
       ORDER BY razao_social ASC`,
    );
    res.json(resultado.rows);
  } catch (erro) {
    res.status(500).json({ erro: "Erro ao listar fornecedores", detalhe: erro.message });
  }
}

async function detalhar(req, res) {
  try {
    const resultado = await db.query(
      `SELECT
         id,
         razao_social AS "razaoSocial",
         nome_fantasia AS "nomeFantasia",
         cnpj,
         contato,
         telefone,
         prazo_medio AS "prazoMedio",
         CASE WHEN ativo THEN 'ok' ELSE 'inativo' END AS status,
         criado_em
       FROM fornecedores
       WHERE id = $1`,
      [req.params.id],
    );

    if (resultado.rows.length === 0) return res.status(404).json({ erro: "Fornecedor não encontrado" });
    res.json(resultado.rows[0]);
  } catch (erro) {
    res.status(500).json({ erro: "Erro ao buscar fornecedor", detalhe: erro.message });
  }
}

module.exports = { listar, detalhar };
