const express = require("express");
const { pool } = require("../config/db");

const router = express.Router();

router.get("/categorias", async (_req, res, next) => {
    try {
        const result = await pool.query("SELECT id, nome FROM categorias ORDER BY nome");
        res.json(result.rows);
    } catch (err) {
        next(err);
    }
});

router.get("/usuarios", async (_req, res, next) => {
    try {
        const result = await pool.query("SELECT id, nome, email, cargo, ativo, criado_em FROM usuarios ORDER BY id");
        res.json(result.rows);
    } catch (err) {
        next(err);
    }
});

module.exports = router;
