const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    title: String,
    status_id: String,
    content: String,
    user_id: String,
    listUser: Array,
    priority_id: String,
    thumbnail: String,
    timeStart: String,
    timeFinish: String,
    completedAt: String,
    deleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: Date,
  },
  { timestamps: true }
);

const Task = mongoose.model("Task", taskSchema, "tasks");
module.exports = Task;
