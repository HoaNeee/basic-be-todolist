const express = require("express");
const router = express.Router();

const controller = require("../controllers/user.controller");
const authMiddleware = require("../../../middleware/auth.middleware");

router.post("/register", controller.register);
router.post("/login", controller.login);
router.post("/forgot-password", controller.forgot);
router.post("/otp", controller.otp);
router.post("/reset-password", controller.resetPassword);
router.get("/detail", authMiddleware.requireAuth, controller.detail);
router.get("/list-user", authMiddleware.requireAuth, controller.listUser);

module.exports = router;
