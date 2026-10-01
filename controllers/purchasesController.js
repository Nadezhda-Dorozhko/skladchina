const { Purchase, Participant } = require("../models");

async function getAllPurchases(req, res, next) {
  try {
    const purchases = await Purchase.findAll({
      order: [["id", "ASC"]],
    });
    res.status(200).json(purchases);
  } catch (err) {
    next(err);
  }
}

async function getPurchaseById(req, res, next) {
  try {
    const purchase = await Purchase.findByPk(req.params.id, {
      include: [{ model: Participant, as: "participants" }],
    });
    if (!purchase) {
      return res
        .status(404)
        .json({ error: `Складчина с id=${req.params.id} не найдена` });
    }
    res.status(200).json(purchase);
  } catch (err) {
    next(err);
  }
}

async function createPurchase(req, res, next) {
  try {
    const { title, organizer, targetAmount, deadline } = req.body;
    if (!title || !organizer || !targetAmount || !deadline) {
      return res.status(400).json({
        error: "Обязательные поля: title, organizer, targetAmount, deadline",
      });
    }
    const newPurchase = await Purchase.create(req.body);
    res.status(201).json(newPurchase);
  } catch (err) {
    if (err.name === "SequelizeValidationError") {
      return res.status(400).json({ error: err.errors.map((e) => e.message) });
    }
    next(err);
  }
}

async function updatePurchase(req, res, next) {
  try {
    const { title, organizer, targetAmount, deadline } = req.body;
    if (!title || !organizer || !targetAmount || !deadline) {
      return res.status(400).json({
        error: "Обязательные поля: title, organizer, targetAmount, deadline",
      });
    }
    const purchase = await Purchase.findByPk(req.params.id);
    if (!purchase) {
      return res
        .status(404)
        .json({ error: `Складчина с id=${req.params.id} не найдена` });
    }
    await purchase.update(req.body);
    res.status(200).json(purchase);
  } catch (err) {
    if (err.name === "SequelizeValidationError") {
      return res.status(400).json({ error: err.errors.map((e) => e.message) });
    }
    next(err);
  }
}

async function deletePurchase(req, res, next) {
  try {
    const purchase = await Purchase.findByPk(req.params.id);
    if (!purchase) {
      return res
        .status(404)
        .json({ error: `Складчина с id=${req.params.id} не найдена` });
    }
    await purchase.destroy();
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

async function addParticipant(req, res, next) {
  try {
    const purchase = await Purchase.findByPk(req.params.id);
    if (!purchase) {
      return res
        .status(404)
        .json({ error: `Складчина с id=${req.params.id} не найдена` });
    }
    const { name, contribution } = req.body;
    if (!name || !contribution) {
      return res
        .status(400)
        .json({ error: "Обязательные поля: name, contribution" });
    }
    const participant = await Participant.create({
      name,
      contribution,
      purchaseId: purchase.id,
    });
    await purchase.increment("currentAmount", { by: contribution });

    res.status(201).json(participant);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAllPurchases,
  getPurchaseById,
  createPurchase,
  updatePurchase,
  deletePurchase,
  addParticipant,
};
