const mongoose = require("mongoose");

const statuSchema = new mongoose.Schema(
  {
    title: String,
    key: String,
    color_id: String,
    deleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: Date,
  },
  { timestamps: true }
);

const Status = mongoose.model("Status", statuSchema, "status");
module.exports = Status;
