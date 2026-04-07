const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});

async function query(consulta, parametros) {
    return pool.query(consulta, parametros);
}

module.exports = { query, pool };
