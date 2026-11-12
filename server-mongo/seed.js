require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Purchase = require("./models/Purchase");
const User = require("./models/User");

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);

  await Promise.all([Purchase.deleteMany({}), User.deleteMany({})]);

  await User.create([
    {
      email: "admin@skladchina.local",
      passwordHash: await bcrypt.hash("Admin123!", 10),
      role: "admin",
    },
    {
      email: "user@skladchina.local",
      passwordHash: await bcrypt.hash("User123!", 10),
    },
  ]);

  // Складчины сразу с вложенными участниками и тегами
  const purchases = await Purchase.create([
    {
      title: "Кофе в зёрнах 5 кг",
      organizer: "Анна",
      targetAmount: 15000,
      deadline: "2026-12-20",
      tags: ["еда", "кофе"],
      participants: [
        { name: "Иван", contribution: 3000 },
        { name: "Мария", contribution: 4500 },
        { name: "Олег", contribution: 2000 },
      ],
    },
    {
      title: "Курс по Python",
      organizer: "Дмитрий",
      targetAmount: 24000,
      deadline: "2027-01-15",
      tags: ["обучение", "программирование"],
      participants: [{ name: "Елена", contribution: 6000 }],
    },
    {
      title: "Набор настольных игр",
      organizer: "Светлана",
      targetAmount: 9000,
      deadline: "2026-12-05",
      status: "completed",
      tags: ["игры"],
      participants: [
        { name: "Павел", contribution: 4500 },
        { name: "Ольга", contribution: 4500 },
      ],
    },
    {
      title: "Чай пуэр, 10 блинов",
      organizer: "Максим",
      targetAmount: 12000,
      deadline: "2027-02-01",
      tags: ["еда", "чай"],
    },
  ]);

  console.log(`Создано пользователей: 2, складчин: ${purchases.length}`);
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("Ошибка seed:", err.message);
  process.exit(1);
});
