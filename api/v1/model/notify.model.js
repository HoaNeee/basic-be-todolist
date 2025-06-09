const mongoose = require("mongoose");

const notifySchema = new mongoose.Schema(
  {
    title: String,
    isRead: {
      type: Boolean,
      default: false,
    },
    typeNotify: String,
    task_id: String,
    user_id: String,
    deleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: Date,
  },
  { timestamps: true }
);

const Notify = mongoose.model("Notify", notifySchema, "notifications");
module.exports = Notify;
