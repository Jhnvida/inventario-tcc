const db = require("../config/db");

function inteiro(valor) {
    const numero = Number(valor);
    return Number.isInteger(numero) ? numero : null;
}

function mapearFornecedor(payload) {
    return {
        razaoSocial: typeof payload.razaoSocial === "string" ? payload.razaoSocial.trim() : null,
        nomeFantasia: typeof payload.nomeFantasia === "string" ? payload.nomeFantasia.trim() : null,
        cnpj: typeof payload.cnpj === "string" ? payload.cnpj.trim() : null,
        contato: typeof payload.contato === "string" ? payload.contato.trim() : null,
        telefone: typeof payload.telefone === "string" ? payload.telefone.trim() : null,
        prazoMedio:
            payload.prazoMedio === undefined || payload.prazoMedio === null || payload.prazoMedio === ""
                ? null
                : inteiro(payload.prazoMedio),
        ativo: payload.ativo,
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
                id,
                razao_social AS "razaoSocial",
                nome_fantasia AS "nomeFantasia",
                cnpj,
                contato,
                telefone,
                prazo_medio AS "prazoMedio",
                ativo,
                CASE WHEN ativo THEN 'ok' ELSE 'inativo' END AS status,
                criado_em
            FROM fornecedores
            WHERE id = $1`,
            [id],
        );

        if (!resultado.rows.length) {
            return res.status(404).json({ erro: "Fornecedor nao encontrado" });
        }

        return res.json(resultado.rows[0]);
    } catch (erro) {
        return res.status(500).json({ erro: "Erro ao buscar fornecedor" });
    }
}

async function listar(req, res) {
    try {
        const resultado = await db.query(
            `SELECT
                id,
                razao_social AS "razaoSocial",
                nome_fantasia AS "nomeFantasia",
                cnpj,
                contato,
                telefone,
                prazo_medio AS "prazoMedio",
                ativo,
                CASE WHEN ativo THEN 'ok' ELSE 'inativo' END AS status,
                criado_em
            FROM fornecedores
            ORDER BY razao_social ASC`,
        );
        res.json(resultado.rows);
    } catch (erro) {
        res.status(500).json({ erro: "Erro ao listar fornecedores" });
    }
}

async function criar(req, res) {
    const dados = mapearFornecedor(req.body || {});
    if (!dados.razaoSocial) {
        return res.status(400).json({ erro: "Dados invalidos" });
    }
    if (dados.prazoMedio !== null && dados.prazoMedio < 0) {
        return res.status(400).json({ erro: "Dados invalidos" });
    }
    if (dados.ativo !== undefined && typeof dados.ativo !== "boolean") {
        return res.status(400).json({ erro: "Dados invalidos" });
    }

    try {
        const resultado = await db.query(
            `INSERT INTO fornecedores (razao_social, nome_fantasia, cnpj, contato, telefone, prazo_medio, ativo)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING
                id,
                razao_social AS "razaoSocial",
                nome_fantasia AS "nomeFantasia",
                cnpj,
                contato,
                telefone,
                prazo_medio AS "prazoMedio",
                ativo,
                CASE WHEN ativo THEN 'ok' ELSE 'inativo' END AS status,
                criado_em`,
            [
                dados.razaoSocial,
                dados.nomeFantasia,
                dados.cnpj,
                dados.contato,
                dados.telefone,
                dados.prazoMedio,
                dados.ativo ?? true,
            ],
        );

        return res.status(201).json(resultado.rows[0]);
    } catch (erro) {
        return res.status(500).json({ erro: "Erro ao criar fornecedor" });
    }
}

async function atualizar(req, res) {
    const id = inteiro(req.params.id);
    if (!id || id <= 0) {
        return res.status(400).json({ erro: "ID invalido" });
    }

    const payload = req.body || {};
    const dados = mapearFornecedor(payload);
    if (!Object.keys(payload).length) {
        return res.status(400).json({ erro: "Dados invalidos" });
    }
    if (payload.razaoSocial !== undefined && !dados.razaoSocial) {
        return res.status(400).json({ erro: "Dados invalidos" });
    }
    if (payload.prazoMedio !== undefined && (dados.prazoMedio === null || dados.prazoMedio < 0) && payload.prazoMedio !== "") {
        return res.status(400).json({ erro: "Dados invalidos" });
    }
    if (payload.ativo !== undefined && typeof dados.ativo !== "boolean") {
        return res.status(400).json({ erro: "Dados invalidos" });
    }

    try {
        const atual = await db.query("SELECT id FROM fornecedores WHERE id = $1", [id]);
        if (!atual.rows.length) {
            return res.status(404).json({ erro: "Fornecedor nao encontrado" });
        }

        const campos = [];
        const valores = [];

        if (payload.razaoSocial !== undefined) {
            campos.push(`razao_social = $${campos.length + 1}`);
            valores.push(dados.razaoSocial);
        }
        if (payload.nomeFantasia !== undefined) {
            campos.push(`nome_fantasia = $${campos.length + 1}`);
            valores.push(dados.nomeFantasia);
        }
        if (payload.cnpj !== undefined) {
            campos.push(`cnpj = $${campos.length + 1}`);
            valores.push(dados.cnpj);
        }
        if (payload.contato !== undefined) {
            campos.push(`contato = $${campos.length + 1}`);
            valores.push(dados.contato);
        }
        if (payload.telefone !== undefined) {
            campos.push(`telefone = $${campos.length + 1}`);
            valores.push(dados.telefone);
        }
        if (payload.prazoMedio !== undefined) {
            campos.push(`prazo_medio = $${campos.length + 1}`);
            valores.push(payload.prazoMedio === "" ? null : dados.prazoMedio);
        }
        if (payload.ativo !== undefined) {
            campos.push(`ativo = $${campos.length + 1}`);
            valores.push(dados.ativo);
        }

        valores.push(id);

        const resultado = await db.query(
            `UPDATE fornecedores
            SET ${campos.join(", ")}
            WHERE id = $${valores.length}
            RETURNING
                id,
                razao_social AS "razaoSocial",
                nome_fantasia AS "nomeFantasia",
                cnpj,
                contato,
                telefone,
                prazo_medio AS "prazoMedio",
                ativo,
                CASE WHEN ativo THEN 'ok' ELSE 'inativo' END AS status,
                criado_em`,
            valores,
        );

        return res.json(resultado.rows[0]);
    } catch (erro) {
        return res.status(500).json({ erro: "Erro ao atualizar fornecedor" });
    }
}

async function remover(req, res) {
    const id = inteiro(req.params.id);
    if (!id || id <= 0) {
        return res.status(400).json({ erro: "ID invalido" });
    }

    try {
        const resultado = await db.query("DELETE FROM fornecedores WHERE id = $1 RETURNING id", [id]);
        if (!resultado.rows.length) {
            return res.status(404).json({ erro: "Fornecedor nao encontrado" });
        }
        return res.status(204).send();
    } catch (erro) {
        return res.status(500).json({ erro: "Erro ao remover fornecedor" });
    }
}

module.exports = { listar, buscarPorId, criar, atualizar, remover };
