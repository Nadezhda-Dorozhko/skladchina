function isAdmin(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    return res
      .status(403)
      .json({ error: "Доступ запрещён: требуется роль admin" });
  }
  next();
}

module.exports = isAdmin;
