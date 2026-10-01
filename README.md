# Skladchina API v3 — Sequelize + PostgreSQL + JWT (Лабораторные работы 2–3)

## Установка

```bash
npm install
```

Создай базу данных PostgreSQL и пропиши строку подключения в `.env`
(шаблон уже лежит в файле, поменяй пользователя/пароль/имя базы под себя):

```
DATABASE_URL=postgres://USER:PASSWORD@localhost:5432/skladchina_db
PORT=3000
JWT_SECRET=длинная_случайная_строка
```

Сгенерировать секрет: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

## Миграции и тестовые данные

```bash
npx sequelize-cli db:migrate     # создать таблицы purchases, participants, users + добавить category
npx sequelize-cli db:seed:all    # тестовые складчины + администратор (admin@skladchina.local / Admin123!)
```

## Запуск

```bash
npm run dev     # с автоперезагрузкой (nodemon)
npm start        # без неё
```

## Модели и связь

- **Purchase** (`purchases`) — складчина: title, description, organizer, targetAmount,
  currentAmount, deadline, status, category.
- **Participant** (`participants`) — участник складчины: name, contribution, purchaseId (FK).
- Связь: `Purchase.hasMany(Participant)` / `Participant.belongsTo(Purchase)` —
  одна складчина может иметь много участников.

## Эндпоинты

| Метод  | URL                          | Описание                              | Успех | Ошибка   |
|--------|------------------------------|----------------------------------------|-------|----------|
| GET    | /purchases                   | Список всех складчин                   | 200   | -        |
| GET    | /purchases/:id               | Складчина по id (с участниками)        | 200   | 404      |
| POST   | /purchases                   | Создать складчину                      | 201   | 400      |
| PUT    | /purchases/:id               | Обновить складчину                     | 200   | 400/404  |
| DELETE | /purchases/:id               | Удалить складчину                      | 204   | 404      |
| POST   | /purchases/:id/participants  | Добавить участника (+увеличить сумму)  | 201   | 400/404  |

## Миграция добавления поля

Файл `migrations/*-add-category-to-purchases.js` демонстрирует изменение схемы
через `addColumn` — добавляет поле `category` в уже существующую таблицу `purchases`.

## Лабораторная работа 3 — аутентификация и авторизация

Реализовано: регистрация (bcrypt), вход (JWT на 1 час), middleware проверки токена,
защищённые маршруты, `GET /profile`. Дополнительный механизм — **ролевая модель (RBAC)**:
поле `role` (`user` / `admin`), middleware `isAdmin`, админские маршруты.

| Метод  | URL                        | Доступ         | Описание                          |
|--------|----------------------------|----------------|-----------------------------------|
| POST   | /auth/register             | все            | Регистрация (201, 409, 400)       |
| POST   | /auth/login                | все            | Вход, возвращает JWT              |
| GET    | /profile (и /auth/me)      | авторизованные | Текущий пользователь              |
| POST/PUT | /purchases, /purchases/:id, /purchases/:id/participants | авторизованные | Создание и изменение |
| DELETE | /purchases/:id             | только admin   | Удаление складчины (403 для user) |
| GET    | /admin/users               | только admin   | Список пользователей              |
| PATCH  | /admin/users/:id/role      | только admin   | Смена роли (`{"role":"admin"}`)   |

Токен передаётся в заголовке `Authorization: Bearer <token>`.
