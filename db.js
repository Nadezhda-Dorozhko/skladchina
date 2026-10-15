// db.js
// Подключение к PostgreSQL. В таблицу request_logs записывается каждый запрос.
const { Pool } = require("pg");

const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
  database: process.env.DB_NAME || "skladchina",
  connectionTimeoutMillis: 3000,
});

// Без обработчика обрыв соединения с БД завершил бы весь процесс Node.js.
pool.on("error", (err) => {
  console.error("Ошибка соединения с базой данных:", err.message);
});

// Создаёт таблицу журнала, если её ещё нет. Ошибка подключения пробрасывается наружу.
async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS request_logs (
      id SERIAL PRIMARY KEY,
      method VARCHAR(10) NOT NULL,
      url TEXT NOT NULL,
      requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

async function writeLog(method, url, requestedAt) {
  await pool.query(
    "INSERT INTO request_logs (method, url, requested_at) VALUES ($1, $2, $3)",
    [method, url, requestedAt]
  );
}

module.exports = { pool, initDb, writeLog };
