const db = require("../config/db");

async function resumo(req, res) {
    try {
        const resultado = await db.query(`
      SELECT
        COUNT(*)::int AS total_produtos,
        COALESCE(SUM(estoque * preco), 0)::float8 AS valor_total,
        COUNT(*) FILTER (WHERE estoque <= minimo)::int AS em_alerta,
        (SELECT COUNT(*)::int FROM pedidos WHERE status IN ('aberto', 'parcial')) AS pedidos_abertos
      FROM produtos
    `);

        const critico = await db.query(`
      SELECT p.nome, p.sku, p.estoque, p.minimo
      FROM produtos p
      WHERE p.estoque <= p.minimo
      ORDER BY (p.estoque::float / NULLIF(p.minimo, 0)) ASC
      LIMIT 5
    `);

        const movimentacoes = await db.query(`
      SELECT
        m.id,
        m.tipo,
        p.nome AS produto,
        p.sku,
        m.quantidade,
        u.nome AS responsavel,
        m.criado_em AS data
      FROM movimentacoes m
      LEFT JOIN produtos p ON p.id = m.produto_id
      LEFT JOIN usuarios u ON u.id = m.responsavel_id
      ORDER BY m.criado_em DESC
      LIMIT 6
    `);

        res.json({
            ...resultado.rows[0],
            estoque_critico: critico.rows,
            movimentacoes_recentes: movimentacoes.rows,
        });
    } catch (erro) {
        res.status(500).json({
            erro: "Erro ao carregar dashboard",
            detalhe: process.env.NODE_ENV === "development" ? erro.message : "Erro interno no servidor",
        });
    }
}

module.exports = { resumo };
