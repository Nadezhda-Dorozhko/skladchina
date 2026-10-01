const express = require("express");
const router = express.Router();
const controller = require("../controllers/authController");
const authMiddleware = require("../middleware/auth");

// Защищённый маршрут: только для авторизованных пользователей
router.get("/", authMiddleware, controller.getProfile);

module.exports = router;
