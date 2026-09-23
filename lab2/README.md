# Skladchina API v2 — Sequelize + PostgreSQL (Лабораторная работа 2)

## Установка

```bash
npm install
```

Создай базу данных PostgreSQL и пропиши строку подключения в `.env`
(шаблон уже лежит в файле, поменяй пользователя/пароль/имя базы под себя):

```
DATABASE_URL=postgres://USER:PASSWORD@localhost:5432/skladchina_db
PORT=3000
```

## Миграции и тестовые данные

```bash
npx sequelize-cli db:migrate     # создать таблицы purchases, participants + добавить category
npx sequelize-cli db:seed:all    # наполнить purchases тестовыми данными
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
