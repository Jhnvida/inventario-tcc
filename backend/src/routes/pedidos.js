const express = require("express");
const { pool } = require("../config/db");

const router = express.Router();

router.get("/", async (_req, res, next) => {
    try {
        const result = await pool.query(
            `SELECT
                p.id,
                p.numero,
                f.razao_social AS fornecedor,
                p.status,
                p.previsao,
                p.criado_em AS data,
                COUNT(i.id)::int AS itens,
                COALESCE(SUM(i.quantidade * i.preco_unitario), 0)::numeric AS valor
             FROM pedidos p
             JOIN fornecedores f ON f.id = p.fornecedor_id
             LEFT JOIN itens_pedido i ON i.pedido_id = p.id
             GROUP BY p.id, f.razao_social
             ORDER BY p.criado_em DESC`,
        );
        res.json(result.rows.map((row) => ({ ...row, valor: Number(row.valor) })));
    } catch (err) {
        next(err);
    }
});

router.post("/", async (req, res, next) => {
    const { fornecedorId, previsao, observacoes, itens, criadoPor } = req.body;
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        const numero = `PED-${Date.now()}`;
        const pedido = await client.query(
            `INSERT INTO pedidos (numero, fornecedor_id, status, previsao, observacoes, criado_por)
             VALUES ($1, $2, 'aberto', $3, $4, $5)
             RETURNING id`,
            [numero, fornecedorId, previsao, observacoes, criadoPor || 1],
        );

        const pedidoId = pedido.rows[0].id;
        for (const item of itens || []) {
            await client.query(
                `INSERT INTO itens_pedido (pedido_id, produto_id, quantidade, preco_unitario)
                 VALUES ($1, $2, $3, $4)`,
                [pedidoId, item.produtoId, item.quantidade, item.precoUnitario],
            );
        }

        await client.query("COMMIT");
        res.status(201).json({ id: pedidoId, numero });
    } catch (err) {
        await client.query("ROLLBACK");
        next(err);
    } finally {
        client.release();
    }
});

router.get("/:id", async (req, res, next) => {
    try {
        const pedidoResult = await pool.query(
            `SELECT id, numero, fornecedor_id, previsao, observacoes
             FROM pedidos
             WHERE id = $1`,
            [req.params.id],
        );
        if (!pedidoResult.rowCount) return res.status(404).json({ message: "Pedido nao encontrado." });

        const itensResult = await pool.query(
            `SELECT produto_id, quantidade, preco_unitario
             FROM itens_pedido
             WHERE pedido_id = $1
             ORDER BY id`,
            [req.params.id],
        );

        const pedido = pedidoResult.rows[0];
        res.json({
            id: pedido.id,
            numero: pedido.numero,
            fornecedorId: pedido.fornecedor_id,
            previsao: pedido.previsao,
            observacoes: pedido.observacoes,
            itens: itensResult.rows.map((item) => ({
                produtoId: item.produto_id,
                quantidade: Number(item.quantidade),
                precoUnitario: Number(item.preco_unitario),
            })),
        });
    } catch (err) {
        next(err);
    }
});

router.put("/:id", async (req, res, next) => {
    const { fornecedorId, previsao, observacoes, itens } = req.body;
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        const pedidoResult = await client.query(
            `UPDATE pedidos
             SET fornecedor_id = $1, previsao = $2, observacoes = $3
             WHERE id = $4
             RETURNING id`,
            [fornecedorId, previsao, observacoes, req.params.id],
        );
        if (!pedidoResult.rowCount) {
            await client.query("ROLLBACK");
            return res.status(404).json({ message: "Pedido nao encontrado." });
        }

        await client.query("DELETE FROM itens_pedido WHERE pedido_id = $1", [req.params.id]);
        for (const item of itens || []) {
            await client.query(
                `INSERT INTO itens_pedido (pedido_id, produto_id, quantidade, preco_unitario)
                 VALUES ($1, $2, $3, $4)`,
                [req.params.id, item.produtoId, item.quantidade, item.precoUnitario],
            );
        }

        await client.query("COMMIT");
        res.json({ id: Number(req.params.id) });
    } catch (err) {
        await client.query("ROLLBACK");
        next(err);
    } finally {
        client.release();
    }
});

router.delete("/:id", async (req, res, next) => {
    try {
        const result = await pool.query("DELETE FROM pedidos WHERE id = $1", [req.params.id]);
        if (!result.rowCount) return res.status(404).json({ message: "Pedido nao encontrado." });
        res.status(204).send();
    } catch (err) {
        next(err);
    }
});

module.exports = router;
