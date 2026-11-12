const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

async function register(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password || String(password).length < 6) {
      return res
        .status(400)
        .json({ error: "Нужны email и пароль (не короче 6 символов)" });
    }
    const passwordHash = await bcrypt.hash(String(password), 10);
    const user = await User.create({ email, passwordHash });
    res.status(201).json({ id: user.id, email: user.email, role: user.role });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: String(email ?? "").toLowerCase() });
    const ok =
      user && (await bcrypt.compare(String(password ?? ""), user.passwordHash));
    if (!ok) {
      return res.status(401).json({ error: "Неверная почта или пароль" });
    }
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
    );
    res.status(200).json({ token });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login };
