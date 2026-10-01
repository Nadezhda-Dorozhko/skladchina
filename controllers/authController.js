const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { User } = require("../models");

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 6;

// POST /auth/register
async function register(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "Обязательные поля: email, password" });
    }
    if (typeof email !== "string" || !EMAIL_RE.test(email)) {
      return res.status(400).json({ error: "Некорректный email" });
    }
    if (typeof password !== "string" || password.length < MIN_PASSWORD_LENGTH) {
      return res.status(400).json({
        error: `Пароль должен быть строкой не короче ${MIN_PASSWORD_LENGTH} символов`,
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existing = await User.findOne({ where: { email: normalizedEmail } });
    if (existing) {
      return res
        .status(409)
        .json({ error: "Пользователь с таким email уже существует" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ email: normalizedEmail, passwordHash });

    res.status(201).json({
      message: "Регистрация прошла успешно",
      user: user.toSafeJSON(),
    });
  } catch (err) {
    if (
      err.name === "SequelizeUniqueConstraintError" ||
      err.name === "SequelizeValidationError"
    ) {
      return res.status(400).json({ error: err.errors.map((e) => e.message) });
    }
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "Обязательные поля: email, password" });
    }

    const user = await User.findOne({
      where: { email: String(email).trim().toLowerCase() },
    });

    const invalid = () =>
      res.status(401).json({ error: "Неверный email или пароль" });

    if (!user) return invalid();

    const passwordOk = await bcrypt.compare(
      String(password),
      user.passwordHash,
    );
    if (!passwordOk) return invalid();

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
    );

    res.status(200).json({ token, tokenType: "Bearer", expiresIn: "1h" });
  } catch (err) {
    next(err);
  }
}

// GET /profile  (и алиас GET /auth/me) — данные текущего пользователя
async function getProfile(req, res, next) {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "Пользователь не найден" });
    }
    res.status(200).json(user.toSafeJSON());
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, getProfile };
