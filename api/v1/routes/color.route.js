const express = require("express");
const router = express.Router();

const controller = require("../controllers/color.controller");

router.get("/", controller.colors);
router.post("/create", controller.create);
router.patch("/edit/:id", controller.edit);
router.get("/undo/:id", controller.undo);
router.delete("/delete/:id", controller.delete);

module.exports = router;
