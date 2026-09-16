const express = require("express");
const purchasesRouter = require("./routes/purchases");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());


app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
  next();
});


app.get("/", (req, res) => {
  res.json({ message: "Skladchina API работает. /purchases" });
});

 
app.use("/purchases", purchasesRouter);


app.use((req, res) => {
  res.status(404).json({ error: "Маршрут не найден" });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Внутренняя ошибка сервера" });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
