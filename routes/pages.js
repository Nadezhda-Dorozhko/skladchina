// routes/pages.js
const express = require("express");
const router = express.Router();
const controller = require("../controllers/pagesController");
const authController = require("../controllers/authController");
const { requireAuth } = require("../middleware/auth");
const {
  limitAddSubmissions,
  requireFormContentType,
  trimBody,
} = require("../middleware/addPurchaseGuards");

router.get("/login", authController.showLogin);
router.post("/logout", authController.logout);
router.get("/", controller.showIndex);
router.get("/item/:id", controller.showItem);
router.get("/add", requireAuth, controller.showAddForm);
router.post(
  "/add",
  requireAuth,
  limitAddSubmissions,
  requireFormContentType,
  trimBody,
  controller.addPurchase,
);

module.exports = router;
