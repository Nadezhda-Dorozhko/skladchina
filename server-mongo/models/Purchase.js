const mongoose = require("mongoose");

function transform(doc, ret) {
  if (ret._id) {
    ret.id = ret._id.toString();
    delete ret._id;
  }
  delete ret.__v;
  if (ret.deadline instanceof Date) {
    ret.deadline = ret.deadline.toISOString().slice(0, 10);
  }
  return ret;
}

const participantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Укажите имя участника"],
    trim: true,
  },
  contribution: {
    type: Number,
    required: [true, "Укажите сумму взноса"],
    min: [1, "Взнос должен быть больше нуля"],
  },
  joinedAt: { type: Date, default: Date.now },
});
participantSchema.set("toJSON", { transform });

const purchaseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Укажите название складчины"],
      trim: true,
      maxlength: [150, "Название не длиннее 150 символов"],
    },
    organizer: {
      type: String,
      required: [true, "Укажите организатора"],
      trim: true,
    },
    targetAmount: {
      type: Number,
      required: [true, "Укажите целевую сумму"],
      min: [1, "Целевая сумма должна быть больше нуля"],
    },
    currentAmount: { type: Number, default: 0, min: 0 },
    deadline: { type: Date, required: [true, "Укажите дату окончания сбора"] },
    status: {
      type: String,
      enum: {
        values: ["active", "completed"],
        message: "Статус: active или completed",
      },
      default: "active",
    },
    tags: [{ type: String, trim: true, lowercase: true }],
    participants: [participantSchema],
  },
  { timestamps: true },
);
purchaseSchema.set("toJSON", { transform });

purchaseSchema.index({ tags: 1 });

purchaseSchema.pre("validate", function () {
  if (this.isNew) {
    this.currentAmount = this.participants.reduce(
      (sum, p) => sum + (p.contribution || 0),
      0,
    );
  }
});

const Purchase = mongoose.model("Purchase", purchaseSchema);
module.exports = Purchase;
