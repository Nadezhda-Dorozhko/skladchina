const mongoose = require("mongoose");

// Сообщение чата складчины. Хранится в отдельной коллекции messages,
// связь с складчиной - ссылка на её _id (история может быть большой,
// поэтому во вложенный массив документа Purchase она не кладётся)
const messageSchema = new mongoose.Schema(
  {
    purchase: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Purchase",
      required: true,
    },
    author: { type: String, required: true, trim: true },
    text: {
      type: String,
      required: [true, "Введите текст сообщения"],
      trim: true,
      maxlength: [1000, "Сообщение не длиннее 1000 символов"],
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

// Выборка последних сообщений складчины идёт по этому индексу
messageSchema.index({ purchase: 1, createdAt: -1 });

messageSchema.set("toJSON", {
  transform(doc, ret) {
    ret.id = ret._id.toString();
    ret.purchase = ret.purchase.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model("Message", messageSchema);
