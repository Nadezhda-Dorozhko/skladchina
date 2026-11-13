// controllers/pagesController.js
// Контроллеры страниц (EJS). Данные берутся из массива в models/purchase.js.
const Purchase = require("../models/purchase");
const { validatePurchase, limits } = require("../validators/purchaseValidator");

const EMPTY_FORM = {
  title: "",
  organizer: "",
  description: "",
  targetAmount: "",
  currentAmount: "0",
  participantsCount: "0",
  deadline: "",
  status: "active",
};

function showIndex(req, res) {
  res.render("index", { purchases: Purchase.getAll() });
}

function showItem(req, res, next) {
  const id = Number(req.params.id);
  const purchase = Purchase.getById(id);
  if (!purchase) {
    return next();
  }
  res.render("item", { purchase });
}

function showAddForm(req, res) {
  res.render("add", { form: EMPTY_FORM, errors: {}, limits });
}

function addPurchase(req, res) {
  const { errors, data, valid } = validatePurchase(req.body);

  if (!valid) {
    return res.status(400).render("add", { form: req.body, errors, limits });
  }

  Purchase.create(data);
  res.redirect("/");
}

module.exports = { showIndex, showItem, showAddForm, addPurchase };
