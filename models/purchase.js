// models/purchase.js
// Временное хранилище "складчин" в памяти сервера.
// В следующих лабораторных работах массив будет заменён на подключение к БД.

let purchases = [
  {
    id: 1,
    title: "Оптовая закупка кофе для офиса",
    description: "Закупка зернового кофе Lavazza, скидка при заказе от 10 кг",
    organizer: "Иван Петров",
    targetAmount: 15000,
    currentAmount: 4500,
    participantsCount: 3,
    deadline: "2026-09-30",
    status: "active",
  },
  {
    id: 2,
    title: "Складчина на настольную игру",
    description: "Коллекционное издание с доставкой из-за рубежа",
    organizer: "Мария Смирнова",
    targetAmount: 8000,
    currentAmount: 8000,
    participantsCount: 5,
    deadline: "2026-08-15",
    status: "completed",
  },
];

let nextId = 3;

module.exports = {
  getAll: () => purchases,

  getById: (id) => purchases.find((p) => p.id === id),

  create: (data) => {
    const newPurchase = {
      id: nextId++,
      title: data.title,
      description: data.description || "",
      organizer: data.organizer,
      targetAmount: data.targetAmount,
      currentAmount: data.currentAmount || 0,
      participantsCount: data.participantsCount || 0,
      deadline: data.deadline,
      status: data.status || "active",
    };
    purchases.push(newPurchase);
    return newPurchase;
  },

  update: (id, data) => {
    const index = purchases.findIndex((p) => p.id === id);
    if (index === -1) return null;
    purchases[index] = { ...purchases[index], ...data, id };
    return purchases[index];
  },

  remove: (id) => {
    const index = purchases.findIndex((p) => p.id === id);
    if (index === -1) return false;
    purchases.splice(index, 1);
    return true;
  },
};
