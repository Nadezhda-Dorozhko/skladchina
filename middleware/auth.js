const jwt = require("jsonwebtoken");

function authMiddleware(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({
        error: "Требуется авторизация: заголовок Authorization: Bearer <token>",
      });
  }

  const token = header.slice("Bearer ".length).trim();

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    const message =
      err.name === "TokenExpiredError"
        ? "Срок действия токена истёк"
        : "Недействительный токен";
    return res.status(401).json({ error: message });
  }
}

module.exports = authMiddleware;
