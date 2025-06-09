const Task = require("../api/v1/model/task.model");

module.exports.isAccess = async (req, res, next) => {
  const user = req.user;
  const taskId = req.params.id;
  const task = await Task.findOne({ _id: taskId, deleted: false });
  if (!task) {
    res.json({
      code: 404,
      message: "Record not found!",
    });
    return;
  }
  if (task.user_id === String(user._id)) {
    next();
  } else {
    const exist = task.listUser.includes(String(user._id));
    if (!exist) {
      res.json({
        code: 400,
        message: "You don't have permission!",
      });
      return;
    }

    next();
  }
};
