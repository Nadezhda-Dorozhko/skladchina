// Начальные данные: используются, если в localStorage ещё ничего нет.
// Структура полей совпадает с моделями Purchase / Participant из лабораторной №3,
// чтобы в лабораторной №5 заменить localStorage на REST API без переделки компонентов.
export const CATEGORIES = ["продукты", "хобби", "техника", "одежда", "книги", "другое"];

export const initialPurchases = [
  {
    id: 1,
    title: "Оптовая закупка кофе для офиса",
    description: "Закупка зернового кофе Lavazza, скидка при заказе от 10 кг",
    organizer: "Иван Петров",
    targetAmount: 15000,
    currentAmount: 4500,
    deadline: "2026-09-30",
    status: "active",
    category: "продукты",
    participants: [
      { id: 101, name: "Анна Орлова", contribution: 2000 },
      { id: 102, name: "Пётр Зайцев", contribution: 2500 },
    ],
  },
  {
    id: 2,
    title: "Складчина на настольную игру",
    description: "Коллекционное издание с доставкой из-за рубежа",
    organizer: "Мария Смирнова",
    targetAmount: 8000,
    currentAmount: 8000,
    deadline: "2026-08-15",
    status: "completed",
    category: "хобби",
    participants: [
      { id: 201, name: "Мария Смирнова", contribution: 2000 },
      { id: 202, name: "Олег Ким", contribution: 2000 },
      { id: 203, name: "Дарья Волкова", contribution: 2000 },
      { id: 204, name: "Егор Соколов", contribution: 2000 },
    ],
  },
  {
    id: 3,
    title: "Книги по React для студенческого клуба",
    description: "Три печатных экземпляра для общей библиотеки клуба",
    organizer: "Алексей Новиков",
    targetAmount: 6000,
    currentAmount: 1500,
    deadline: "2026-11-30",
    status: "active",
    category: "книги",
    participants: [{ id: 301, name: "Алексей Новиков", contribution: 1500 }],
  },
  {
    id: 4,
    title: "Групповой заказ худи с принтом",
    description: "Тираж от 12 штук, цена за единицу снижается",
    organizer: "Елена Фролова",
    targetAmount: 24000,
    currentAmount: 9600,
    deadline: "2026-12-10",
    status: "active",
    category: "одежда",
    participants: [
      { id: 401, name: "Елена Фролова", contribution: 3200 },
      { id: 402, name: "Никита Лебедев", contribution: 3200 },
      { id: 403, name: "Софья Белова", contribution: 3200 },
    ],
  },
];
