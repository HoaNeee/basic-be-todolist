const express = require("express");
const router = express.Router();

const controller = require("../controllers/notify.controller");

router.post("/create", controller.create);
router.get("/", controller.get);
router.patch("/read/:id", controller.read);
router.delete("/delete/:id", controller.delete);

module.exports = router;
