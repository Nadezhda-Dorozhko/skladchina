const Purchase = require("../models/Purchase");

const REQUIRED_MSG =
  "Обязательные поля: title, organizer, targetAmount, deadline";
const notFound = (res, id) =>
  res.status(404).json({ error: `Складчина с id=${id} не найдена` });

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

async function getAllPurchases(req, res, next) {
  try {
    const filter = {};
    const search = String(req.query.search ?? "").trim();
    const tag = String(req.query.tag ?? "")
      .trim()
      .toLowerCase();
    if (search) filter.title = { $regex: escapeRegex(search), $options: "i" };
    if (tag) filter.tags = tag; // совпадение с любым элементом массива

    const purchases = await Purchase.find(filter).sort({ createdAt: -1 });
    res.status(200).json(purchases);
  } catch (err) {
    next(err);
  }
}

async function getPurchaseById(req, res, next) {
  try {
    const purchase = await Purchase.findById(req.params.id);
    if (!purchase) return notFound(res, req.params.id);
    res.status(200).json(purchase);
  } catch (err) {
    next(err);
  }
}

async function createPurchase(req, res, next) {
  try {
    const {
      title,
      organizer,
      targetAmount,
      deadline,
      status,
      tags,
      participants,
    } = req.body;
    if (!title || !organizer || !targetAmount || !deadline) {
      return res.status(400).json({ error: REQUIRED_MSG });
    }
    const purchase = await Purchase.create({
      title,
      organizer,
      targetAmount,
      deadline,
      status,
      tags,
      participants,
    });
    res.status(201).json(purchase);
  } catch (err) {
    next(err);
  }
}

async function updatePurchase(req, res, next) {
  try {
    const { title, organizer, targetAmount, deadline, status, tags } = req.body;
    if (!title || !organizer || !targetAmount || !deadline) {
      return res.status(400).json({ error: REQUIRED_MSG });
    }
    const changes = { title, organizer, targetAmount, deadline };
    if (status !== undefined) changes.status = status;
    if (tags !== undefined) changes.tags = tags;

    const purchase = await Purchase.findByIdAndUpdate(req.params.id, changes, {
      new: true, // вернуть документ после обновления
      runValidators: true, // проверять схему и при обновлении
    });
    if (!purchase) return notFound(res, req.params.id);
    res.status(200).json(purchase);
  } catch (err) {
    next(err);
  }
}

async function deletePurchase(req, res, next) {
  try {
    const purchase = await Purchase.findByIdAndDelete(req.params.id);
    if (!purchase) return notFound(res, req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

// ---------- Вложенные структуры: участники ----------

// POST /purchases/:id/participants
// $push добавляет участника в массив, $inc увеличивает собранную сумму -
// всё одним атомарным запросом (в SQL это INSERT в другую таблицу + UPDATE)
async function addParticipant(req, res, next) {
  try {
    const name = String(req.body.name ?? "").trim();
    const contribution = Number(req.body.contribution);
    if (!name || !(contribution > 0)) {
      return res
        .status(400)
        .json({ error: "Обязательные поля: name, contribution (> 0)" });
    }
    const purchase = await Purchase.findByIdAndUpdate(
      req.params.id,
      {
        $push: { participants: { name, contribution } },
        $inc: { currentAmount: contribution },
      },
      { new: true, runValidators: true },
    );
    if (!purchase) return notFound(res, req.params.id);
    res.status(201).json(purchase);
  } catch (err) {
    next(err);
  }
}

// PATCH /purchases/:id/participants/:participantId/contribution
// Тело: { "amount": 500 } - участник доплачивает.
// Позиционный оператор $ обновляет именно найденный элемент массива.
async function increaseContribution(req, res, next) {
  try {
    const amount = Number(req.body.amount);
    if (!(amount > 0)) {
      return res
        .status(400)
        .json({ error: "Поле amount должно быть больше нуля" });
    }
    const { id, participantId } = req.params;
    const purchase = await Purchase.findOneAndUpdate(
      { _id: id, "participants._id": participantId },
      {
        $inc: {
          "participants.$.contribution": amount,
          currentAmount: amount,
        },
      },
      { new: true },
    );
    if (!purchase) {
      return res
        .status(404)
        .json({ error: "Складчина или участник не найдены" });
    }
    res.status(200).json(purchase);
  } catch (err) {
    next(err);
  }
}

// DELETE /purchases/:id/participants/:participantId
// $pull удаляет элемент из массива, взнос вычитается из собранной суммы
async function removeParticipant(req, res, next) {
  try {
    const { id, participantId } = req.params;
    const found = await Purchase.findById(id);
    const participant = found?.participants.id(participantId);
    if (!participant) {
      return res
        .status(404)
        .json({ error: "Складчина или участник не найдены" });
    }
    const { contribution } = participant;

    const result = await Purchase.updateOne(
      { _id: id, "participants._id": participantId },
      {
        $pull: { participants: { _id: participantId } },
        $inc: { currentAmount: -contribution },
      },
    );
    if (result.modifiedCount === 0) {
      return res
        .status(404)
        .json({ error: "Складчина или участник не найдены" });
    }
    res.status(204).send();
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
  increaseContribution,
  removeParticipant,
};
