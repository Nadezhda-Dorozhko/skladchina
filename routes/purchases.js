const express = require("express");
const router = express.Router();
const controller = require("../controllers/purchasesController");
const authMiddleware = require("../middleware/auth");
const isAdmin = require("../middleware/isAdmin");

router.get("/", controller.getAllPurchases);
router.get("/:id", controller.getPurchaseById);

router.post("/", authMiddleware, controller.createPurchase);
router.put("/:id", authMiddleware, controller.updatePurchase);
router.post("/:id/participants", authMiddleware, controller.addParticipant);

router.delete("/:id", authMiddleware, isAdmin, controller.deletePurchase);

module.exports = router;
