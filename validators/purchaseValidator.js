// validators/purchaseValidator.js
// Проверка полей формы. Ограничения читаются из config/limits.json.
const limits = require("../config/limits.json");

const LABELS = {
  title: "Название",
  organizer: "Организатор",
  description: "Описание",
  targetAmount: "Целевая сумма",
  currentAmount: "Собранная сумма",
  participantsCount: "Количество участников",
  deadline: "Срок завершения",
};

function checkText(field, raw, errors, required) {
  const value = String(raw ?? "");
  const trimmed = value.trim();
  const lim = limits[field];

  if (trimmed === "") {
    if (!required) return "";
    errors[field] =
      value === ""
        ? `${LABELS[field]}: поле не заполнено.`
        : `${LABELS[field]}: поле не может состоять только из пробелов.`;
    return "";
  }
  if (lim.min && trimmed.length < lim.min) {
    errors[field] = `${LABELS[field]}: минимум ${lim.min} симв.`;
  } else if (trimmed.length > lim.max) {
    errors[field] = `${LABELS[field]}: максимум ${lim.max} симв. (введено ${trimmed.length}).`;
  }
  return trimmed;
}

function checkNumber(field, raw, errors, integerOnly) {
  const value = String(raw ?? "");
  const trimmed = value.trim();
  const lim = limits[field];

  if (trimmed === "") {
    errors[field] =
      value === ""
        ? `${LABELS[field]}: поле не заполнено.`
        : `${LABELS[field]}: поле не может состоять только из пробелов.`;
    return null;
  }
  const num = Number(trimmed.replace(",", "."));
  if (Number.isNaN(num)) {
    errors[field] = `${LABELS[field]}: нужно ввести число.`;
  } else if (num < lim.min) {
    errors[field] = `${LABELS[field]}: значение не может быть меньше ${lim.min}.`;
  } else if (num > lim.max) {
    errors[field] = `${LABELS[field]}: значение не может быть больше ${lim.max}.`;
  } else if (integerOnly && !Number.isInteger(num)) {
    errors[field] = `${LABELS[field]}: нужно целое число.`;
  }
  return num;
}

function validatePurchase(body) {
  const errors = {};
  const data = {
    title: checkText("title", body.title, errors, true),
    organizer: checkText("organizer", body.organizer, errors, true),
    description: checkText("description", body.description, errors, false),
    targetAmount: checkNumber("targetAmount", body.targetAmount, errors, false),
    currentAmount: checkNumber("currentAmount", body.currentAmount, errors, false),
    participantsCount: checkNumber("participantsCount", body.participantsCount, errors, true),
    deadline: String(body.deadline ?? "").trim(),
    status: body.status === "completed" ? "completed" : "active",
  };

  if (data.deadline === "") {
    errors.deadline = `${LABELS.deadline}: поле не заполнено.`;
  } else if (Number.isNaN(Date.parse(data.deadline))) {
    errors.deadline = `${LABELS.deadline}: некорректная дата.`;
  }

  return { errors, data, valid: Object.keys(errors).length === 0 };
}

module.exports = { validatePurchase, limits };
