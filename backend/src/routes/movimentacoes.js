const express = require("express");
const { pool } = require("../config/db");

const router = express.Router();

router.get("/", async (_req, res, next) => {
    try {
        const result = await pool.query(
            `SELECT
                m.id, m.produto_id, m.tipo, p.nome AS produto, p.sku, m.quantidade,
                m.responsavel_id, u.nome AS responsavel, m.observacao, m.pedido_id, m.criado_em AS data
             FROM movimentacoes m
             JOIN produtos p ON p.id = m.produto_id
             JOIN usuarios u ON u.id = m.responsavel_id
             ORDER BY m.criado_em DESC`,
        );
        res.json(
            result.rows.map((row) => ({
                ...row,
                produtoId: row.produto_id,
                responsavelId: row.responsavel_id,
                pedidoId: row.pedido_id,
                quantidade: Number(row.quantidade),
            })),
        );
    } catch (err) {
        next(err);
    }
});

router.post("/", async (req, res, next) => {
    const { produtoId, tipo, quantidade, observacao, responsavelId, pedidoId } = req.body;
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        const estoqueAtualRes = await client.query("SELECT estoque FROM produtos WHERE id = $1 FOR UPDATE", [
            produtoId,
        ]);

        if (!estoqueAtualRes.rowCount) {
            await client.query("ROLLBACK");
            return res.status(404).json({ message: "Produto nao encontrado." });
        }

        const estoqueAtual = Number(estoqueAtualRes.rows[0].estoque);
        const saldoApos = tipo === "entrada" ? estoqueAtual + quantidade : estoqueAtual - quantidade;
        if (saldoApos < 0) {
            await client.query("ROLLBACK");
            return res.status(400).json({ message: "Estoque insuficiente para saida." });
        }

        await client.query("UPDATE produtos SET estoque = $1, atualizado_em = NOW() WHERE id = $2", [
            saldoApos,
            produtoId,
        ]);
        const mov = await client.query(
            `INSERT INTO movimentacoes (produto_id, tipo, quantidade, saldo_apos, observacao, pedido_id, responsavel_id)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING id`,
            [produtoId, tipo, quantidade, saldoApos, observacao, pedidoId, responsavelId || 1],
        );

        await client.query("COMMIT");
        res.status(201).json({ id: mov.rows[0].id });
    } catch (err) {
        await client.query("ROLLBACK");
        next(err);
    } finally {
        client.release();
    }
});

router.get("/:id", async (req, res, next) => {
    try {
        const result = await pool.query(
            `SELECT id, produto_id, tipo, quantidade, observacao, responsavel_id, pedido_id
             FROM movimentacoes
             WHERE id = $1`,
            [req.params.id],
        );
        if (!result.rowCount) return res.status(404).json({ message: "Movimentacao nao encontrada." });
        const mov = result.rows[0];
        res.json({
            id: mov.id,
            produtoId: mov.produto_id,
            tipo: mov.tipo,
            quantidade: Number(mov.quantidade),
            observacao: mov.observacao,
            responsavelId: mov.responsavel_id,
            pedidoId: mov.pedido_id,
        });
    } catch (err) {
        next(err);
    }
});

router.put("/:id", async (req, res, next) => {
    const { produtoId, tipo, quantidade, observacao, responsavelId, pedidoId } = req.body;
    const client = await pool.connect();
    try {
        await client.query("BEGIN");

        const atual = await client.query(
            `SELECT produto_id, tipo, quantidade
             FROM movimentacoes
             WHERE id = $1
             FOR UPDATE`,
            [req.params.id],
        );
        if (!atual.rowCount) {
            await client.query("ROLLBACK");
            return res.status(404).json({ message: "Movimentacao nao encontrada." });
        }

        const movAtual = atual.rows[0];

        const produtoAntigoRes = await client.query("SELECT estoque FROM produtos WHERE id = $1 FOR UPDATE", [
            movAtual.produto_id,
        ]);
        if (!produtoAntigoRes.rowCount) {
            await client.query("ROLLBACK");
            return res.status(404).json({ message: "Produto da movimentacao nao encontrado." });
        }

        let estoqueAntigo = Number(produtoAntigoRes.rows[0].estoque);
        estoqueAntigo =
            movAtual.tipo === "entrada"
                ? estoqueAntigo - Number(movAtual.quantidade)
                : estoqueAntigo + Number(movAtual.quantidade);
        if (estoqueAntigo < 0) {
            await client.query("ROLLBACK");
            return res.status(400).json({ message: "Nao foi possivel reverter estoque da movimentacao antiga." });
        }
        await client.query("UPDATE produtos SET estoque = $1, atualizado_em = NOW() WHERE id = $2", [
            estoqueAntigo,
            movAtual.produto_id,
        ]);

        const produtoNovoRes = await client.query("SELECT estoque FROM produtos WHERE id = $1 FOR UPDATE", [produtoId]);
        if (!produtoNovoRes.rowCount) {
            await client.query("ROLLBACK");
            return res.status(404).json({ message: "Produto nao encontrado." });
        }

        const estoqueNovoAtual = Number(produtoNovoRes.rows[0].estoque);
        const saldoApos =
            tipo === "entrada" ? estoqueNovoAtual + Number(quantidade) : estoqueNovoAtual - Number(quantidade);
        if (saldoApos < 0) {
            await client.query("ROLLBACK");
            return res.status(400).json({ message: "Estoque insuficiente para saida." });
        }

        await client.query("UPDATE produtos SET estoque = $1, atualizado_em = NOW() WHERE id = $2", [
            saldoApos,
            produtoId,
        ]);
        await client.query(
            `UPDATE movimentacoes
             SET produto_id = $1, tipo = $2, quantidade = $3, saldo_apos = $4, observacao = $5, pedido_id = $6, responsavel_id = $7
             WHERE id = $8`,
            [produtoId, tipo, quantidade, saldoApos, observacao, pedidoId, responsavelId || 1, req.params.id],
        );

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
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        const movRes = await client.query(
            `SELECT produto_id, tipo, quantidade
             FROM movimentacoes
             WHERE id = $1
             FOR UPDATE`,
            [req.params.id],
        );
        if (!movRes.rowCount) {
            await client.query("ROLLBACK");
            return res.status(404).json({ message: "Movimentacao nao encontrada." });
        }
        const mov = movRes.rows[0];

        const prodRes = await client.query("SELECT estoque FROM produtos WHERE id = $1 FOR UPDATE", [mov.produto_id]);
        if (!prodRes.rowCount) {
            await client.query("ROLLBACK");
            return res.status(404).json({ message: "Produto nao encontrado." });
        }

        let novoEstoque = Number(prodRes.rows[0].estoque);
        novoEstoque =
            mov.tipo === "entrada" ? novoEstoque - Number(mov.quantidade) : novoEstoque + Number(mov.quantidade);
        if (novoEstoque < 0) {
            await client.query("ROLLBACK");
            return res.status(400).json({ message: "Nao foi possivel excluir: estoque ficaria negativo." });
        }

        await client.query("UPDATE produtos SET estoque = $1, atualizado_em = NOW() WHERE id = $2", [
            novoEstoque,
            mov.produto_id,
        ]);
        await client.query("DELETE FROM movimentacoes WHERE id = $1", [req.params.id]);

        await client.query("COMMIT");
        res.status(204).send();
    } catch (err) {
        await client.query("ROLLBACK");
        next(err);
    } finally {
        client.release();
    }
});

module.exports = router;
