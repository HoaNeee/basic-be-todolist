const Notify = require("../model/notify.model");
const Task = require("../model/task.model");
const Priority = require("../model/prority.model");
const Color = require("../model/color.model");

// [POST] /api/v1/notify/create
module.exports.create = async (req, res) => {
  try {
    const { title, task_id, users } = req.body;
    for (const item of users) {
      const notify = new Notify({
        title: title,
        task_id: task_id,
        user_id: item,
      });
      await notify.save();
    }
    res.json({
      code: 200,
      message: "OK",
    });
  } catch (error) {
    res.json({
      code: 500,
      message: "An error occurred in server" + error,
    });
  }
};

// [GET] /api/v1/notify
module.exports.get = async (req, res) => {
  try {
    const userId = req.user.id;
    const records = await Notify.find({
      user_id: userId,
      deleted: false,
    }).lean();
    for (const record of records) {
      const task = await Task.findOne({ _id: record.task_id })
        .select("title thumbnail priority_id")
        .lean();

      if (task) {
        const priority = await Priority.findOne({ _id: task.priority_id });
        if (priority) {
          task.priority = priority.title;
          const color = await Color.findOne({ _id: priority.color_id });
          if (color) {
            task.priorityColor = color.hex;
          }
        }
        record.task = task;
      }
    }
    res.json({
      code: 200,
      message: "OK",
      data: records,
    });
  } catch (error) {
    res.json({
      code: 500,
      message: "An error occurred in server" + error,
    });
  }
};

// [PATCH] /api/v1/notify/read/:id
module.exports.read = async (req, res) => {
  try {
    const id = req.params.id;
    await Notify.updateOne({ _id: id }, { isRead: true });

    res.json({
      code: 200,
      message: "OK",
    });
  } catch (error) {
    res.json({
      code: 500,
      message: "An error occurred in server " + error,
    });
  }
};

// [DELETE] /api/v1/notify/delete/:id
module.exports.delete = async (req, res) => {
  try {
    const id = req.params.id;
    await Notify.updateOne(
      { _id: id },
      { deleted: true, deletedAt: new Date() }
    );

    res.json({
      code: 200,
      message: "OK",
    });
  } catch (error) {
    res.json({
      code: 500,
      message: "An error occurred in server " + error,
    });
  }
};
