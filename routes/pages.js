// routes/pages.js
const express = require("express");
const router = express.Router();
const controller = require("../controllers/pagesController");

router.get("/", controller.showIndex);
router.get("/item/:id", controller.showItem);
router.get("/add", controller.showAddForm);
router.post("/add", controller.addPurchase);
router.get("/error", controller.triggerError);

module.exports = router;
