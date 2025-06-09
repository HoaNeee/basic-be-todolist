const express = require("express");
const router = express.Router();

const controller = require("../controllers/task.controller");

const taskMiddleware = require("../../../middleware/task.middleware");

router.get("/", controller.task);
router.post("/create", controller.create);
router.get("/detail/:id", taskMiddleware.isAccess, controller.detail);
router.patch("/change-multi", taskMiddleware.isAccess, controller.changeMulti);
router.patch(
  "/change-status/:id",
  taskMiddleware.isAccess,
  controller.changeStatus
);
router.patch("/edit/:id", taskMiddleware.isAccess, controller.edit);
router.delete("/delete/:id", taskMiddleware.isAccess, controller.delete);

module.exports = router;
