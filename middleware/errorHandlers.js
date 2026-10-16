// middleware/errorHandlers.js
const FALLBACK_500 =
  "<!DOCTYPE html><html lang=\"ru\"><head><meta charset=\"utf-8\"><title>500</title></head>" +
  "<body><h1>500</h1><p>Внутренняя ошибка сервера.</p><a href=\"/\">На главную</a></body></html>";

// Текст ошибки. У AggregateError (несколько неудачных попыток подключения,
// например к ::1 и 127.0.0.1) свойство message пустое, причины лежат в err.errors.
function describeError(err) {
  if (err && err.message) return err.message;
  if (err && Array.isArray(err.errors) && err.errors.length > 0) {
    return err.errors.map((e) => e.message || e.code || String(e)).join("; ");
  }
  return (err && (err.code || err.name)) || "причина не определена";
}

// 404: подходит для любого запроса, который не обработали маршруты выше.
function notFoundHandler(req, res) {
  res.status(404).render("404", { url: req.originalUrl });
}

// 500: четыре параметра (err, req, res, next) — так Express распознаёт обработчик ошибок.
function serverErrorHandler(err, req, res, next) {
  console.error(`[${new Date().toISOString()}] Ошибка при ${req.method} ${req.originalUrl}`);
  console.error(err.stack || err);

  // Если ответ уже частично отправлен, дальше отвечает стандартный обработчик Express.
  if (res.headersSent) {
    return next(err);
  }

  const data = {
    message: err.userMessage || "Во время обработки запроса произошла непредвиденная ошибка.",
    details: describeError(err),
  };

  // Если не удалось отрисовать 500.ejs, отправляется запасная HTML-страница, а не обычный текст.
  res.status(500).render("500", data, (renderErr, html) => {
    if (renderErr) {
      console.error("Не удалось отрисовать 500.ejs:", renderErr.message);
      return res.type("html").send(FALLBACK_500);
    }
    res.send(html);
  });
}

module.exports = { notFoundHandler, serverErrorHandler, describeError };
