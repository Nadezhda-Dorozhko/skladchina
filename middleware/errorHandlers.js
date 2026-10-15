// middleware/errorHandlers.js
const FALLBACK_500 =
  "<!DOCTYPE html><html lang=\"ru\"><head><meta charset=\"utf-8\"><title>500</title></head>" +
  "<body><h1>500</h1><p>Внутренняя ошибка сервера.</p><a href=\"/\">На главную</a></body></html>";

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
    details: err.message,
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

module.exports = { notFoundHandler, serverErrorHandler };
