const db = require("../config/db");

function inteiro(valor) {
    const numero = Number(valor);
    return Number.isInteger(numero) ? numero : null;
}

function numero(valor) {
    const numero = Number(valor);
    return Number.isFinite(numero) ? numero : null;
}

function mapearProduto(payload) {
    return {
        nome: typeof payload.nome === "string" ? payload.nome.trim() : null,
        sku: typeof payload.sku === "string" ? payload.sku.trim() : null,
        categoriaId: payload.categoriaId ? inteiro(payload.categoriaId) : null,
        local: typeof payload.local === "string" ? payload.local.trim() : null,
        estoque: inteiro(payload.estoque),
        minimo: inteiro(payload.minimo),
        preco: numero(payload.preco),
    };
}

async function buscarPorId(req, res) {
    const id = inteiro(req.params.id);
    if (!id || id <= 0) {
        return res.status(400).json({ erro: "ID invalido" });
    }

    try {
        const resultado = await db.query(
            `SELECT
                p.id,
                p.nome,
                p.sku,
                p.categoria_id AS "categoriaId",
                c.nome AS categoria,
                p.localizacao AS local,
                p.estoque,
                p.minimo,
                p.preco,
                p.criado_em,
                p.atualizado_em
            FROM produtos p
            LEFT JOIN categorias c ON c.id = p.categoria_id
            WHERE p.id = $1`,
            [id],
        );

        if (!resultado.rows.length) {
            return res.status(404).json({ erro: "Produto nao encontrado" });
        }

        return res.json(resultado.rows[0]);
    } catch (erro) {
        return res.status(500).json({ erro: "Erro ao buscar produto" });
    }
}

async function listar(req, res) {
    try {
        const resultado = await db.query(
            `SELECT
                p.id,
                p.nome,
                p.sku,
                c.nome AS categoria,
                p.localizacao AS local,
                p.estoque,
                p.minimo,
                p.preco,
                p.criado_em,
                p.atualizado_em
            FROM produtos p
            LEFT JOIN categorias c ON c.id = p.categoria_id
            ORDER BY p.nome ASC`,
        );

        res.json(resultado.rows);
    } catch (erro) {
        res.status(500).json({ erro: "Erro ao listar produtos" });
    }
}

async function criar(req, res) {
    const dados = mapearProduto(req.body || {});
    if (!dados.nome || !dados.sku || dados.estoque === null || dados.minimo === null || dados.preco === null) {
        return res.status(400).json({ erro: "Dados invalidos" });
    }
    if (dados.estoque < 0 || dados.minimo < 0 || dados.preco < 0) {
        return res.status(400).json({ erro: "Dados invalidos" });
    }

    try {
        const resultado = await db.query(
            `INSERT INTO produtos (nome, sku, categoria_id, localizacao, estoque, minimo, preco)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING
                id,
                nome,
                sku,
                categoria_id AS "categoriaId",
                localizacao AS local,
                estoque,
                minimo,
                preco,
                criado_em,
                atualizado_em`,
            [dados.nome, dados.sku, dados.categoriaId, dados.local, dados.estoque, dados.minimo, dados.preco],
        );

        return res.status(201).json(resultado.rows[0]);
    } catch (erro) {
        return res.status(500).json({ erro: "Erro ao criar produto" });
    }
}

async function atualizar(req, res) {
    const id = inteiro(req.params.id);
    if (!id || id <= 0) {
        return res.status(400).json({ erro: "ID invalido" });
    }

    const payload = req.body || {};
    const dados = mapearProduto(payload);
    if (!Object.keys(payload).length) {
        return res.status(400).json({ erro: "Dados invalidos" });
    }
    if (payload.nome !== undefined && !dados.nome) {
        return res.status(400).json({ erro: "Dados invalidos" });
    }
    if (payload.sku !== undefined && !dados.sku) {
        return res.status(400).json({ erro: "Dados invalidos" });
    }
    if (payload.estoque !== undefined && dados.estoque === null) {
        return res.status(400).json({ erro: "Dados invalidos" });
    }
    if (payload.estoque !== undefined && dados.estoque < 0) {
        return res.status(400).json({ erro: "Dados invalidos" });
    }
    if (payload.minimo !== undefined && dados.minimo === null) {
        return res.status(400).json({ erro: "Dados invalidos" });
    }
    if (payload.minimo !== undefined && dados.minimo < 0) {
        return res.status(400).json({ erro: "Dados invalidos" });
    }
    if (payload.preco !== undefined && dados.preco === null) {
        return res.status(400).json({ erro: "Dados invalidos" });
    }
    if (payload.preco !== undefined && dados.preco < 0) {
        return res.status(400).json({ erro: "Dados invalidos" });
    }
    if (
        payload.categoriaId !== undefined &&
        payload.categoriaId !== null &&
        payload.categoriaId !== "" &&
        dados.categoriaId === null
    ) {
        return res.status(400).json({ erro: "Dados invalidos" });
    }

    try {
        const atual = await db.query("SELECT id FROM produtos WHERE id = $1", [id]);
        if (!atual.rows.length) {
            return res.status(404).json({ erro: "Produto nao encontrado" });
        }

        const campos = [];
        const valores = [];

        if (payload.nome !== undefined) {
            campos.push(`nome = $${campos.length + 1}`);
            valores.push(dados.nome);
        }
        if (payload.sku !== undefined) {
            campos.push(`sku = $${campos.length + 1}`);
            valores.push(dados.sku);
        }
        if (payload.categoriaId !== undefined) {
            campos.push(`categoria_id = $${campos.length + 1}`);
            valores.push(dados.categoriaId);
        }
        if (payload.local !== undefined) {
            campos.push(`localizacao = $${campos.length + 1}`);
            valores.push(dados.local);
        }
        if (payload.estoque !== undefined) {
            campos.push(`estoque = $${campos.length + 1}`);
            valores.push(dados.estoque);
        }
        if (payload.minimo !== undefined) {
            campos.push(`minimo = $${campos.length + 1}`);
            valores.push(dados.minimo);
        }
        if (payload.preco !== undefined) {
            campos.push(`preco = $${campos.length + 1}`);
            valores.push(dados.preco);
        }

        campos.push(`atualizado_em = NOW()`);
        valores.push(id);

        const resultado = await db.query(
            `UPDATE produtos
            SET ${campos.join(", ")}
            WHERE id = $${valores.length}
            RETURNING
                id,
                nome,
                sku,
                categoria_id AS "categoriaId",
                localizacao AS local,
                estoque,
                minimo,
                preco,
                criado_em,
                atualizado_em`,
            valores,
        );

        return res.json(resultado.rows[0]);
    } catch (erro) {
        return res.status(500).json({ erro: "Erro ao atualizar produto" });
    }
}

async function remover(req, res) {
    const id = inteiro(req.params.id);
    if (!id || id <= 0) {
        return res.status(400).json({ erro: "ID invalido" });
    }

    try {
        const resultado = await db.query("DELETE FROM produtos WHERE id = $1 RETURNING id", [id]);
        if (!resultado.rows.length) {
            return res.status(404).json({ erro: "Produto nao encontrado" });
        }
        return res.status(204).send();
    } catch (erro) {
        return res.status(500).json({ erro: "Erro ao remover produto" });
    }
}

module.exports = { listar, buscarPorId, criar, atualizar, remover };
