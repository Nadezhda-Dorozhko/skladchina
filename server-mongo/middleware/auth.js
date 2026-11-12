const jwt = require("jsonwebtoken");

// Проверка JWT из заголовка Authorization: Bearer <токен>
function authRequired(req, res, next) {
  const header = req.headers.authorization || "";
  const [type, token] = header.split(" ");
  if (type !== "Bearer" || !token) {
    return res.status(401).json({ error: "Требуется авторизация" });
  }
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: "Недействительный или просроченный токен" });
  }
}

// Доступ только для администратора
function isAdmin(req, res, next) {
  if (req.user?.role !== "admin") {
    return res
      .status(403)
      .json({ error: "Доступ запрещён: требуется роль admin" });
  }
  next();
}

module.exports = { authRequired, isAdmin };
