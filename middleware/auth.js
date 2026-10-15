// middleware/auth.js
// Имитация авторизации: параметр ?auth=1 означает, что пользователь вошёл.
function fakeAuth(req, res, next) {
  if (req.query.auth === "1") {
    req.user = { name: "Организатор", isAuth: true };
  } else {
    req.user = { name: "Гость", isAuth: false };
  }
  res.locals.user = req.user;
  res.locals.authQuery = req.user.isAuth ? "?auth=1" : "";
  next();
}

module.exports = fakeAuth;
