const db = require("../config/db");

async function listar(req, res) {
    try {
        const resultado = await db.query(
            `SELECT
         m.id,
         m.tipo,
         p.nome AS produto,
         p.sku,
         m.quantidade,
         m.saldo_apos,
         m.observacao,
         u.nome AS responsavel,
         m.criado_em AS data
       FROM movimentacoes m
       LEFT JOIN produtos p ON p.id = m.produto_id
       LEFT JOIN usuarios u ON u.id = m.responsavel_id
       ORDER BY m.criado_em DESC`,
        );

        res.json(resultado.rows);
    } catch (erro) {
        res.status(500).json({
            erro: "Erro ao listar movimentações",
            detalhe: process.env.NODE_ENV === "development" ? erro.message : "Erro interno no servidor",
        });
    }
}

module.exports = { listar };
