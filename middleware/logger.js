// middleware/logger.js
// Выводит в консоль метод, URL и время запроса и записывает их в таблицу request_logs.
const { writeLog } = require("../db");

async function requestLogger(req, res, next) {
  const requestedAt = new Date();
  console.log(`[${requestedAt.toISOString()}] ${req.method} ${req.originalUrl}`);

  try {
    await writeLog(req.method, req.originalUrl, requestedAt);
    next();
  } catch (err) {
    err.userMessage =
      "Не удалось записать запрос в журнал базы данных (таблица request_logs).";
    next(err);
  }
}

module.exports = requestLogger;
