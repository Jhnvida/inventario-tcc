const express = require("express");
const { pool } = require("../config/db");
const { toFornecedor } = require("../utils/mappers");

const router = express.Router();

router.get("/", async (_req, res, next) => {
    try {
        const result = await pool.query("SELECT * FROM fornecedores ORDER BY id DESC");
        res.json(result.rows.map(toFornecedor));
    } catch (err) {
        next(err);
    }
});

router.post("/", async (req, res, next) => {
    const { razaoSocial, nomeFantasia, cnpj, contato, telefone, prazoMedio, ativo } = req.body;
    try {
        const result = await pool.query(
            `INSERT INTO fornecedores (razao_social, nome_fantasia, cnpj, contato, telefone, prazo_medio, ativo)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING *`,
            [razaoSocial, nomeFantasia, cnpj, contato, telefone, prazoMedio, ativo],
        );
        res.status(201).json(toFornecedor(result.rows[0]));
    } catch (err) {
        next(err);
    }
});

router.put("/:id", async (req, res, next) => {
    const { razaoSocial, nomeFantasia, cnpj, contato, telefone, prazoMedio, ativo } = req.body;
    try {
        const result = await pool.query(
            `UPDATE fornecedores
             SET razao_social = $1, nome_fantasia = $2, cnpj = $3, contato = $4, telefone = $5, prazo_medio = $6, ativo = $7
             WHERE id = $8
             RETURNING *`,
            [razaoSocial, nomeFantasia, cnpj, contato, telefone, prazoMedio, ativo, req.params.id],
        );
        if (!result.rowCount) return res.status(404).json({ message: "Fornecedor nao encontrado." });
        res.json(toFornecedor(result.rows[0]));
    } catch (err) {
        next(err);
    }
});

router.delete("/:id", async (req, res, next) => {
    try {
        const result = await pool.query("DELETE FROM fornecedores WHERE id = $1", [req.params.id]);
        if (!result.rowCount) return res.status(404).json({ message: "Fornecedor nao encontrado." });
        res.status(204).send();
    } catch (err) {
        next(err);
    }
});

module.exports = router;
