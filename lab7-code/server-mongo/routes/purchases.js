const router = require("express").Router();
const mongoose = require("mongoose");
const c = require("../controllers/purchasesController");
const { authRequired, isAdmin } = require("../middleware/auth");

const checkId = (req, res, next, value) =>
  mongoose.isValidObjectId(value)
    ? next()
    : res.status(400).json({ error: `Некорректный идентификатор: ${value}` });
router.param("id", checkId);
router.param("participantId", checkId);

router.use(authRequired);

router.get("/", c.getAllPurchases);
router.get("/:id", c.getPurchaseById);
router.post("/", c.createPurchase);
router.put("/:id", c.updatePurchase);
router.delete("/:id", isAdmin, c.deletePurchase);

router.post("/:id/participants", c.addParticipant);
router.patch(
  "/:id/participants/:participantId/contribution",
  c.increaseContribution,
);
router.delete("/:id/participants/:participantId", c.removeParticipant);

module.exports = router;
