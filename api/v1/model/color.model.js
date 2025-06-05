const mongoose = require("mongoose");

const colorSchema = new mongoose.Schema(
  {
    title: String,
    hex: String,
    deleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: Date,
  },
  { timestamps: true }
);

const Color = mongoose.model("Color", colorSchema, "colors");
module.exports = Color;
