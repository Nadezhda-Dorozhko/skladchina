const express = require("express");
const router = express.Router();
const controller = require("../controllers/adminController");
const authMiddleware = require("../middleware/auth");
const isAdmin = require("../middleware/isAdmin");

router.use(authMiddleware, isAdmin);

router.get("/users", controller.listUsers);
router.patch("/users/:id/role", controller.setRole);

module.exports = router;
