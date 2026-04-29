const express = require("express");
const { pool } = require("../config/db");

const router = express.Router();

router.get("/", async (_req, res, next) => {
    try {
        const [resumo, criticos, movs, pedidosAbertos] = await Promise.all([
            pool.query(
                `SELECT
                    COUNT(*)::int AS total_produtos,
                    COALESCE(SUM(preco * estoque), 0)::numeric AS valor_total,
                    COUNT(*) FILTER (WHERE estoque < minimo)::int AS em_alerta
                 FROM produtos`,
            ),
            pool.query(
                `SELECT nome, sku, estoque, minimo
                 FROM produtos
                 WHERE estoque < minimo
                 ORDER BY (minimo - estoque) DESC
                 LIMIT 5`,
            ),
            pool.query(
                `SELECT m.id, m.tipo, p.nome AS produto, p.sku, m.quantidade, u.nome AS responsavel, m.criado_em AS data
                 FROM movimentacoes m
                 JOIN produtos p ON p.id = m.produto_id
                 JOIN usuarios u ON u.id = m.responsavel_id
                 ORDER BY m.criado_em DESC
                 LIMIT 5`,
            ),
            pool.query(
                `SELECT COUNT(*)::int AS pedidos_abertos
                 FROM pedidos
                 WHERE status IN ('aberto', 'parcial')`,
            ),
        ]);

        res.json({
            total_produtos: resumo.rows[0].total_produtos,
            valor_total: Number(resumo.rows[0].valor_total),
            em_alerta: resumo.rows[0].em_alerta,
            pedidos_abertos: pedidosAbertos.rows[0].pedidos_abertos,
            estoque_critico: criticos.rows,
            movimentacoes_recentes: movs.rows.map((row) => ({
                ...row,
                quantidade: Number(row.quantidade),
            })),
        });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
