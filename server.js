const express = require("express");
const path = require("path");
const pagesRouter = require("./routes/pages");
const purchasesRouter = require("./routes/purchases");
const requestLogger = require("./middleware/logger");
const fakeAuth = require("./middleware/auth");
const { notFoundHandler, serverErrorHandler } = require("./middleware/errorHandlers");
const { initDb } = require("./db");

const app = express();
const PORT = process.env.PORT || 3000;

app.set("view engine", "ejs");
app.set("views", "./views");

// Встроенные middleware
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Значения по умолчанию для шаблонов: задаются до логирования,
// чтобы страница 500 отрисовалась даже при ошибке в logger.
app.use((req, res, next) => {
  res.locals.user = { name: "Гость", isAuth: false };
  res.locals.authQuery = "";
  res.locals.formatDate = (iso) =>
    new Date(iso).toLocaleString("ru-RU", {
      timeZone: "Europe/Minsk",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      fractionalSecondDigits: 3,
    });
  next();
});

// Кастомные middleware
app.use(requestLogger);
app.use(fakeAuth);

// Маршруты
app.use("/", pagesRouter);
app.use("/purchases", purchasesRouter);

// Обработка ошибок: подключается строго после всех маршрутов
app.use(notFoundHandler);
app.use(serverErrorHandler);

// Сервер запускается только после успешного подключения к базе данных
initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Ошибка: не удалось подключиться к базе данных:", err.message);
    process.exit(1);
  });
