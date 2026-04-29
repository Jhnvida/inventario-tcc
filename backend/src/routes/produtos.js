const express = require("express");
const { pool } = require("../config/db");
const { toProduto } = require("../utils/mappers");

const router = express.Router();

router.get("/", async (_req, res, next) => {
    try {
        const result = await pool.query(
            `SELECT p.*, c.nome AS categoria
             FROM produtos p
             LEFT JOIN categorias c ON c.id = p.categoria_id
             ORDER BY p.id DESC`,
        );
        res.json(result.rows.map(toProduto));
    } catch (err) {
        next(err);
    }
});

router.post("/", async (req, res, next) => {
    const { nome, sku, categoriaId, local, estoque, minimo, preco } = req.body;
    try {
        const result = await pool.query(
            `INSERT INTO produtos (nome, sku, categoria_id, localizacao, estoque, minimo, preco)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING *`,
            [nome, sku, categoriaId || null, local || null, estoque, minimo, preco],
        );
        res.status(201).json(toProduto(result.rows[0]));
    } catch (err) {
        next(err);
    }
});

router.put("/:id", async (req, res, next) => {
    const { nome, sku, categoriaId, local, estoque, minimo, preco } = req.body;
    try {
        const result = await pool.query(
            `UPDATE produtos
             SET nome = $1, sku = $2, categoria_id = $3, localizacao = $4, estoque = $5, minimo = $6, preco = $7, atualizado_em = NOW()
             WHERE id = $8
             RETURNING *`,
            [nome, sku, categoriaId || null, local || null, estoque, minimo, preco, req.params.id],
        );
        if (!result.rowCount) return res.status(404).json({ message: "Produto nao encontrado." });
        res.json(toProduto(result.rows[0]));
    } catch (err) {
        next(err);
    }
});

router.delete("/:id", async (req, res, next) => {
    try {
        const result = await pool.query("DELETE FROM produtos WHERE id = $1", [req.params.id]);
        if (!result.rowCount) return res.status(404).json({ message: "Produto nao encontrado." });
        res.status(204).send();
    } catch (err) {
        next(err);
    }
});

module.exports = router;
