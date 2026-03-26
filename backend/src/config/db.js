const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function query(consulta, parametros) {
  const cliente = await pool.connect();

  try {
    const resultado = await cliente.query(consulta, parametros);
    return resultado;
  } finally {
    cliente.release();
  }
}

module.exports = { query, pool };
