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
    createdAt: "2026-10-01T09:15:42.318Z",
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
    createdAt: "2026-10-05T14:02:11.906Z",
  },
];

let nextId = 3;

// Время создания уникально для каждой складчины: если оно совпало бы
// с предыдущим с точностью до миллисекунды, оно сдвигается на 1 мс.
let lastCreatedAt = Math.max(...purchases.map((p) => Date.parse(p.createdAt)));
function uniqueCreatedAt() {
  lastCreatedAt = Math.max(Date.now(), lastCreatedAt + 1);
  return new Date(lastCreatedAt).toISOString();
}

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
      createdAt: uniqueCreatedAt(),
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
