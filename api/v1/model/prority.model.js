const mongoose = require("mongoose");

const prioritySchema = new mongoose.Schema(
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

const Priority = mongoose.model("Priority", prioritySchema, "priority");
module.exports = Priority;
