// Рассылка событий Socket.IO из обычных REST-обработчиков.
// Экземпляр io сохраняется в app (app.set("io", io)) в файле server.js.
function notifyPurchaseChange(req, purchase, text) {
  const io = req.app.get("io");
  if (!io) return;

  const data = purchase.toJSON();
  // 1) участникам чата этой складчины - свежий документ целиком
  io.to(`purchase:${data.id}`).emit("purchase:updated", data);

  // 2) всем подключённым пользователям - короткое уведомление
  const reached = data.currentAmount >= data.targetAmount;
  io.emit("notification", {
    purchaseId: data.id,
    text: reached ? `${text}. Цель сбора достигнута!` : text,
    currentAmount: data.currentAmount,
    targetAmount: data.targetAmount,
    at: new Date().toISOString(),
  });
}

module.exports = { notifyPurchaseChange };
