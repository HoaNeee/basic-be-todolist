const express = require("express");
const router = express.Router();

const controller = require("../controllers/status.controller");

router.get("/", controller.status);
router.post("/create", controller.create);
router.patch("/edit/:id", controller.edit);
router.delete("/delete/:id", controller.delete);

module.exports = router;
