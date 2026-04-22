const db = require("../config/db");

function inteiro(valor) {
    const numero = Number(valor);
    return Number.isInteger(numero) ? numero : null;
}

async function listar(req, res) {
    try {
        const resultado = await db.query(
            `SELECT
                p.id,
                p.numero,
                COALESCE(f.nome_fantasia, f.razao_social) AS fornecedor,
                p.status,
                p.previsao,
                p.criado_em AS data,
                COUNT(ip.id)::int AS itens,
                COALESCE(SUM(ip.quantidade * ip.preco_unitario), 0)::float8 AS valor
            FROM pedidos p
            LEFT JOIN fornecedores f ON f.id = p.fornecedor_id
            LEFT JOIN itens_pedido ip ON ip.pedido_id = p.id
            GROUP BY p.id, f.id
            ORDER BY p.criado_em DESC`,
        );

        res.json(resultado.rows);
    } catch (erro) {
        res.status(500).json({ erro: "Erro ao listar pedidos" });
    }
}

async function buscarPorId(req, res) {
    const id = inteiro(req.params.id);
    if (!id || id <= 0) {
        return res.status(400).json({ erro: "ID invalido" });
    }

    try {
        const pedido = await db.query(
            `SELECT
                p.id,
                p.numero,
                p.fornecedor_id AS "fornecedorId",
                p.status,
                p.previsao,
                p.observacoes,
                p.criado_por AS "criadoPor",
                p.recebido_em AS "recebidoEm",
                p.criado_em AS data
            FROM pedidos p
            WHERE p.id = $1`,
            [id],
        );

        if (!pedido.rows.length) {
            return res.status(404).json({ erro: "Pedido nao encontrado" });
        }

        const itens = await db.query(
            `SELECT
                id,
                pedido_id AS "pedidoId",
                produto_id AS "produtoId",
                quantidade,
                preco_unitario AS "precoUnitario"
            FROM itens_pedido
            WHERE pedido_id = $1
            ORDER BY id`,
            [id],
        );

        return res.json({ ...pedido.rows[0], itens: itens.rows });
    } catch (erro) {
        return res.status(500).json({ erro: "Erro ao buscar pedido" });
    }
}

async function criar(req, res) {
    const { fornecedorId, previsao = null, observacoes = null, criadoPor, itens = [] } = req.body || {};
    if (!inteiro(fornecedorId) || !inteiro(criadoPor) || !Array.isArray(itens) || !itens.length) {
        return res.status(400).json({ erro: "Dados invalidos para criar pedido" });
    }

    for (const item of itens) {
        const produtoId = inteiro(item.produtoId);
        const quantidade = inteiro(item.quantidade);
        const precoUnitario = Number(item.precoUnitario);
        if (!produtoId || !quantidade || quantidade <= 0 || !Number.isFinite(precoUnitario) || precoUnitario < 0) {
            return res.status(400).json({ erro: "Dados invalidos para criar pedido" });
        }
    }

    const cliente = await db.pool.connect();
    try {
        await cliente.query("BEGIN");

        const numero = `PED-${Date.now()}`;
        const pedidoInserido = await cliente.query(
            `INSERT INTO pedidos (numero, fornecedor_id, status, previsao, observacoes, criado_por)
            VALUES ($1, $2, 'aberto', $3, $4, $5)
            RETURNING
                id,
                numero,
                fornecedor_id AS "fornecedorId",
                status,
                previsao,
                observacoes,
                criado_por AS "criadoPor",
                criado_em AS data`,
            [numero, fornecedorId, previsao, observacoes, criadoPor],
        );
        const pedido = pedidoInserido.rows[0];

        const itensCriados = [];
        for (const item of itens) {
            const produtoId = inteiro(item.produtoId);
            const quantidade = inteiro(item.quantidade);
            const precoUnitario = Number(item.precoUnitario);

            const itemInserido = await cliente.query(
                `INSERT INTO itens_pedido (pedido_id, produto_id, quantidade, preco_unitario)
                VALUES ($1, $2, $3, $4)
                RETURNING
                    id,
                    pedido_id AS "pedidoId",
                    produto_id AS "produtoId",
                    quantidade,
                    preco_unitario AS "precoUnitario"`,
                [pedido.id, produtoId, quantidade, precoUnitario],
            );
            itensCriados.push(itemInserido.rows[0]);
        }

        await cliente.query("COMMIT");
        return res.status(201).json({ ...pedido, itens: itensCriados });
    } catch (erro) {
        await cliente.query("ROLLBACK");
        return res.status(500).json({ erro: "Erro ao criar pedido" });
    } finally {
        cliente.release();
    }
}

module.exports = { listar, buscarPorId, criar };
