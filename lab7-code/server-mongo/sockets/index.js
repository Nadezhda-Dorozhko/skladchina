const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const Purchase = require("../models/Purchase");
const Message = require("../models/Message");

const HISTORY_LIMIT = 50;
const roomName = (purchaseId) => `purchase:${purchaseId}`;

// Список пользователей комнаты: у каждого сокета свой id,
// поэтому один человек в двух вкладках отображается дважды
async function getRoomUsers(io, purchaseId) {
  const sockets = await io.in(roomName(purchaseId)).fetchSockets();
  return sockets.map((s) => ({ socketId: s.id, email: s.data.user.email }));
}

function initSockets(io) {
  // Проверка JWT при установлении соединения (handshake)
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("Требуется авторизация"));
    try {
      socket.data.user = jwt.verify(token, process.env.JWT_SECRET);
      next();
    } catch {
      next(new Error("Недействительный или просроченный токен"));
    }
  });

  io.on("connection", (socket) => {
    const user = socket.data.user;
    console.log(`Подключился ${user.email} (${socket.id})`);

    // Всем остальным - сообщение о подключении, всем - новое число онлайн
    socket.broadcast.emit("system", `${user.email} подключился`);
    io.emit("online", io.sockets.sockets.size);

    // ---------- Комнаты ----------
    // Клиент -> сервер: room:join. Ответ приходит в callback (acknowledgement)
    socket.on("room:join", async (purchaseId, ack) => {
      try {
        if (!mongoose.isValidObjectId(purchaseId)) {
          return ack?.({ ok: false, error: "Некорректный идентификатор" });
        }
        const purchase = await Purchase.findById(purchaseId);
        if (!purchase) {
          return ack?.({ ok: false, error: "Складчина не найдена" });
        }

        socket.join(roomName(purchaseId));
        socket.to(roomName(purchaseId)).emit("room:system", {
          text: `${user.email} вошёл в чат`,
        });

        // История из MongoDB: последние сообщения в хронологическом порядке
        const history = (
          await Message.find({ purchase: purchaseId })
            .sort({ createdAt: -1 })
            .limit(HISTORY_LIMIT)
        ).reverse();

        const users = await getRoomUsers(io, purchaseId);
        io.to(roomName(purchaseId)).emit("room:users", users);
        ack?.({ ok: true, history, purchase, users });
      } catch (err) {
        console.error(err);
        ack?.({ ok: false, error: "Не удалось войти в комнату" });
      }
    });

    socket.on("room:leave", async (purchaseId) => {
      socket.leave(roomName(purchaseId));
      socket.to(roomName(purchaseId)).emit("room:system", {
        text: `${user.email} покинул чат`,
      });
      const users = await getRoomUsers(io, purchaseId);
      io.to(roomName(purchaseId)).emit("room:users", users);
    });

    // ---------- Сообщения чата ----------
    socket.on("chat:message", async ({ purchaseId, text } = {}, ack) => {
      try {
        if (!socket.rooms.has(roomName(purchaseId))) {
          return ack?.({ ok: false, error: "Сначала войдите в комнату" });
        }
        const message = await Message.create({
          purchase: purchaseId,
          author: user.email,
          text,
        });
        io.to(roomName(purchaseId)).emit("chat:message", message);
        ack?.({ ok: true });
      } catch (err) {
        const error =
          err.name === "ValidationError"
            ? Object.values(err.errors)[0].message
            : "Не удалось отправить сообщение";
        ack?.({ ok: false, error });
      }
    });

    // Индикатор набора текста: отправляется всем в комнате, кроме автора
    socket.on("chat:typing", ({ purchaseId, isTyping } = {}) => {
      socket.to(roomName(purchaseId)).emit("chat:typing", {
        email: user.email,
        isTyping: Boolean(isTyping),
      });
    });

    // ---------- Приватные сообщения по socket.id ----------
    socket.on("private:message", ({ to, text } = {}, ack) => {
      const body = String(text ?? "").trim();
      if (!body || !io.sockets.sockets.has(to)) {
        return ack?.({ ok: false, error: "Получатель недоступен" });
      }
      const payload = {
        from: user.email,
        fromSocketId: socket.id,
        to,
        text: body,
        at: new Date().toISOString(),
      };
      io.to(to).emit("private:message", payload); // получателю
      socket.emit("private:message", payload); // копия отправителю
      ack?.({ ok: true });
    });

    // ---------- Отключение ----------
    // В "disconnecting" сокет ещё состоит в комнатах - можно сообщить им
    let rooms = [];
    socket.on("disconnecting", () => {
      rooms = [...socket.rooms].filter((r) => r.startsWith("purchase:"));
      for (const room of rooms) {
        socket.to(room).emit("room:system", { text: `${user.email} отключился` });
      }
    });

    socket.on("disconnect", async () => {
      console.log(`Отключился ${user.email} (${socket.id})`);
      io.emit("system", `${user.email} отключился`);
      io.emit("online", io.sockets.sockets.size);
      // сокет уже вышел из комнат - рассылаем обновлённые списки
      for (const room of rooms) {
        const purchaseId = room.replace("purchase:", "");
        io.to(room).emit("room:users", await getRoomUsers(io, purchaseId));
      }
    });
  });
}

module.exports = initSockets;
