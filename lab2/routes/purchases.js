const express = require("express");
const router = express.Router();
const controller = require("../controllers/purchasesController");

router.get("/", controller.getAllPurchases);
router.get("/:id", controller.getPurchaseById);
router.post("/", controller.createPurchase);
router.put("/:id", controller.updatePurchase);
router.delete("/:id", controller.deletePurchase);
router.post("/:id/participants", controller.addParticipant);

module.exports = router;
