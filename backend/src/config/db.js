const { Pool } = require("pg");
require("dotenv").config();

const connectionString = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL;

if (!connectionString) {
    throw new Error("Defina DATABASE_URL (ou SUPABASE_DB_URL) no arquivo .env do backend.");
}

const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
});

module.exports = { pool };
