function showLogin(req, res) {
  if (req.user.isAuth) return res.redirect("/");
  res.render("login");
}

function logout(req, res) {
  res.clearCookie("mc_auth", { path: "/" });
  res.redirect("/");
}

module.exports = { showLogin, logout };
