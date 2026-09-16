# Skladchina API — Лабораторная работа 1

REST API для платформы управления групповыми закупками (складчина).

## Запуск

```bash
npm install
npm run dev     # с автоперезагрузкой (nodemon)
# или
npm start
```

Сервер стартует на http://localhost:3000

## Эндпоинты

| Метод  | URL              | Описание                       | Успех | Ошибки  |
|--------|------------------|---------------------------------|-------|---------|
| GET    | /purchases       | Список всех складчин            | 200   | -       |
| GET    | /purchases/:id   | Одна складчина по id            | 200   | 404     |
| POST   | /purchases       | Создать новую складчину         | 201   | 400     |
| PUT    | /purchases/:id   | Полностью обновить складчину    | 200   | 400/404 |
| DELETE | /purchases/:id   | Удалить складчину               | 204   | 404     |

## Пример POST-запроса

```bash
curl -X POST http://localhost:3000/purchases \
  -H "Content-Type: application/json" \
  -d '{"title":"Складчина на принтер","organizer":"Анна","targetAmount":20000,"deadline":"2026-10-01"}'
```

## Структура проекта

```
lab1-skladchina/
├── server.js                           # точка входа, middleware, обработчики ошибок
├── routes/purchases.js                 # маршруты ресурса
├── controllers/purchasesController.js  # логика обработки запросов
├── models/purchase.js                  # хранилище данных (массив в памяти)
└── package.json
```
