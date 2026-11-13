// middleware/auth.js
function attachUser(req, res, next) {
  const queryAuth = req.query.auth === "1";
  const cookieAuth = req.cookies.mc_auth === "1";

  if (queryAuth) {
    res.cookie("mc_auth", "1", {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 24 * 60 * 60 * 1000,
    });
  }

  req.user = queryAuth || cookieAuth
    ? { name: "Организатор", role: "organizer", isAuth: true }
    : { name: "Гость", role: "guest", isAuth: false };
  res.locals.user = req.user;
  next();
}

function requireAuth(req, res, next) {
  if (req.user.role !== "guest") return next();
  if (req.method === "GET") return res.redirect("/login");
  return res.status(401).json({ error: "Требуется вход в систему." });
}

module.exports = { attachUser, requireAuth };
