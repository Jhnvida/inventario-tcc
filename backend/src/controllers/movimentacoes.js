const db = require("../config/db");

function inteiro(valor) {
    const numero = Number(valor);
    return Number.isInteger(numero) ? numero : null;
}

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
        res.status(500).json({ erro: "Erro ao listar movimentacoes" });
    }
}

async function criar(req, res) {
    const { produtoId, tipo, quantidade, observacao = null, pedidoId = null, responsavelId } = req.body || {};
    const qtd = inteiro(quantidade);
    const pedidoIdNormalizado = pedidoId === null || pedidoId === undefined || pedidoId === "" ? null : inteiro(pedidoId);
    if (!inteiro(produtoId) || !inteiro(responsavelId) || !qtd || qtd <= 0) {
        return res.status(400).json({ erro: "Dados invalidos para movimentacao" });
    }
    if (pedidoIdNormalizado !== null && pedidoIdNormalizado <= 0) {
        return res.status(400).json({ erro: "Dados invalidos para movimentacao" });
    }
    if (tipo !== "entrada" && tipo !== "saida") {
        return res.status(400).json({ erro: "Tipo de movimentacao invalido" });
    }

    const cliente = await db.pool.connect();
    try {
        await cliente.query("BEGIN");

        const produto = await cliente.query("SELECT id, estoque FROM produtos WHERE id = $1 FOR UPDATE", [produtoId]);
        if (!produto.rows.length) {
            await cliente.query("ROLLBACK");
            return res.status(404).json({ erro: "Produto nao encontrado" });
        }

        const estoqueAtual = Number(produto.rows[0].estoque);
        const saldoApos = tipo === "entrada" ? estoqueAtual + qtd : estoqueAtual - qtd;
        if (saldoApos < 0) {
            await cliente.query("ROLLBACK");
            return res.status(400).json({ erro: "Estoque insuficiente para saida" });
        }

        await cliente.query("UPDATE produtos SET estoque = $1, atualizado_em = NOW() WHERE id = $2", [
            saldoApos,
            produtoId,
        ]);

        const resultado = await cliente.query(
            `INSERT INTO movimentacoes (produto_id, tipo, quantidade, saldo_apos, observacao, pedido_id, responsavel_id)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING
                id,
                produto_id AS "produtoId",
                tipo,
                quantidade,
                saldo_apos AS "saldoApos",
                observacao,
                pedido_id AS "pedidoId",
                responsavel_id AS "responsavelId",
                criado_em AS data`,
            [produtoId, tipo, qtd, saldoApos, observacao, pedidoIdNormalizado, responsavelId],
        );

        await cliente.query("COMMIT");
        return res.status(201).json(resultado.rows[0]);
    } catch (erro) {
        await cliente.query("ROLLBACK");
        return res.status(500).json({ erro: "Erro ao criar movimentacao" });
    } finally {
        cliente.release();
    }
}

module.exports = { listar, criar };
