const { User } = require("../models");

async function listUsers(req, res, next) {
  try {
    const users = await User.findAll({
      attributes: ["id", "email", "role", "createdAt"],
      order: [["id", "ASC"]],
    });
    res.status(200).json(users);
  } catch (err) {
    next(err);
  }
}

async function setRole(req, res, next) {
  try {
    const { role } = req.body;
    if (!["user", "admin"].includes(role)) {
      return res
        .status(400)
        .json({ error: "Поле role должно быть 'user' или 'admin'" });
    }

    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res
        .status(404)
        .json({ error: `Пользователь с id=${req.params.id} не найден` });
    }

    // Чтобы администратор случайно не лишил админа самого себя
    if (user.id === req.user.id && role !== "admin") {
      return res
        .status(400)
        .json({ error: "Нельзя снять роль admin с самого себя" });
    }

    await user.update({ role });
    res.status(200).json(user.toSafeJSON());
  } catch (err) {
    next(err);
  }
}

module.exports = { listUsers, setRole };
