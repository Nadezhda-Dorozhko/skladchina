const Purchase = require("../models/purchase");

// GET /purchases
function getAllPurchases(req, res) {
  res.status(200).json(Purchase.getAll());
}

// GET /purchases/:id
function getPurchaseById(req, res) {
  const id = Number(req.params.id);
  const purchase = Purchase.getById(id);

  if (!purchase) {
    return res.status(404).json({ error: `Складчина с id=${id} не найдена` });
  }
  res.status(200).json(purchase);
}

// POST /purchases
function createPurchase(req, res) {
  const { title, organizer, targetAmount, deadline } = req.body;

  if (!title || !organizer || !targetAmount || !deadline) {
    return res.status(400).json({
      error:
        "Обязательные поля: title, organizer, targetAmount, deadline",
    });
  }

  if (typeof targetAmount !== "number" || targetAmount <= 0) {
    return res
      .status(400)
      .json({ error: "targetAmount должен быть положительным числом" });
  }

  const newPurchase = Purchase.create(req.body);
  res.status(201).json(newPurchase);
}

// PUT /purchases/:id
function updatePurchase(req, res) {
  const id = Number(req.params.id);
  const { title, organizer, targetAmount, deadline } = req.body;

  if (!title || !organizer || !targetAmount || !deadline) {
    return res.status(400).json({
      error:
        "Обязательные поля: title, organizer, targetAmount, deadline",
    });
  }

  const updated = Purchase.update(id, req.body);

  if (!updated) {
    return res.status(404).json({ error: `Складчина с id=${id} не найдена` });
  }
  res.status(200).json(updated);
}

// DELETE /purchases/:id
function deletePurchase(req, res) {
  const id = Number(req.params.id);
  const success = Purchase.remove(id);

  if (!success) {
    return res.status(404).json({ error: `Складчина с id=${id} не найдена` });
  }
  res.status(204).send();
}

module.exports = {
  getAllPurchases,
  getPurchaseById,
  createPurchase,
  updatePurchase,
  deletePurchase,
};
