require("dotenv").config();
const express = require("express");
const { sequelize } = require("./models");
const purchasesRouter = require("./routes/purchases");
const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const adminRouter = require("./routes/admin");

if (!process.env.JWT_SECRET) {
  console.error("Не задана переменная окружения JWT_SECRET (см. .env.example)");
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
  next();
});

app.get("/", (req, res) => {
  res.json({
    message: "Skladchina API (Sequelize + PostgreSQL). См. /purchases, /auth, /profile",
  });
});

app.use("/auth", authRouter);
app.use("/profile", profileRouter);
app.use("/admin", adminRouter);
app.use("/purchases", purchasesRouter);

app.use((req, res) => {
  res.status(404).json({ error: "Маршрут не найден" });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Внутренняя ошибка сервера" });
});

sequelize
  .authenticate()
  .then(() => {
    console.log("Подключение к PostgreSQL установлено успешно.");
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Не удалось подключиться к базе данных:", err);
  });
