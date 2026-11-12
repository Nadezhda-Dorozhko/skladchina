require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const authRouter = require("./routes/auth");
const purchasesRouter = require("./routes/purchases");

for (const name of ["MONGO_URI", "JWT_SECRET"]) {
  if (!process.env[name]) {
    console.error(`Не задана переменная окружения ${name}`);
    process.exit(1);
  }
}

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
  next();
});

app.get("/", (req, res) => {
  res.json({
    message: "Skladchina API (Mongoose + MongoDB). См. /purchases, /auth",
  });
});

app.use("/auth", authRouter);
app.use("/purchases", purchasesRouter);

app.use((req, res) => {
  res.status(404).json({ error: "Маршрут не найден" });
});

app.use((err, req, res, next) => {
  if (err.name === "ValidationError") {
    return res
      .status(400)
      .json({ error: Object.values(err.errors).map((e) => e.message) });
  }
  if (err.name === "CastError") {
    return res
      .status(400)
      .json({ error: `Некорректное значение поля ${err.path}` });
  }
  if (err.code === 11000) {
    return res.status(409).json({ error: "Такая запись уже существует" });
  }
  console.error(err.stack);
  res.status(500).json({ error: "Внутренняя ошибка сервера" });
});

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  });
