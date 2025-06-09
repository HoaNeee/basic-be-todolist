const express = require("express");
const router = express.Router();
const controller = require("../controllers/upload.controller");
const multer = require("multer");
const upload = multer();
const uploadMiddleware = require("../../../middleware/uploadCloud.middleware");

router.post(
  "/task",
  upload.single("thumbnail"),
  uploadMiddleware.uploadCloud,
  controller.post
);

router.post(
  "/user",
  upload.single("avatar"),
  uploadMiddleware.uploadCloud,
  controller.post
);

module.exports = router;
