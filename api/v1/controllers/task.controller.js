const Task = require("../model/task.model");
const Status = require("../model/status.model");
const Prioriry = require("../model/prority.model");
const Color = require("../model/color.model");
const User = require("../model/user.model");
const Notify = require("../model/notify.model");

const paginationHelper = require("../../../helpers/pagination");
const searchHelper = require("../../../helpers/search");

const socket = require("../../../socket");

//[GET] /api/v1/tasks
module.exports.task = async (req, res) => {
  try {
    const user = req.user;
    const userId = String(user._id);
    const find = {
      $or: [
        {
          user_id: userId,
        },
        {
          listUser: userId,
        },
      ],
      deleted: false,
    };

    //count record
    const totalTask = await Task.countDocuments(find);

    //filter
    if (req.query.status) {
      const status = await Status.findOne({
        key: req.query.status,
        deleted: false,
      });
      if (status) {
        find.status_id = status.id;
      }
    }
    if (req.query.priority) {
      const priority = await Prioriry.findOne({
        key: req.query.priority,
        deleted: false,
      });
      if (priority) {
        find.priority_id = priority.id;
      }
    }

    //search
    const objectSearch = searchHelper(req.query);
    if (req.query.keyword) {
      find.title = objectSearch.regex;
    }

    //sort
    const sort = {};

    if (req.query.sortKey && req.query.sortValue) {
      sort[req.query.sortKey] = req.query.sortValue;
    }

    const totalRecord = await Task.countDocuments(find);

    //pagination
    const objectPagination = paginationHelper(
      {
        currentPage: 1,
        limitItems: req.query.limit || 2,
      },
      req.query,
      totalRecord
    );

    const tasks = await Task.find(find)
      .sort(sort)
      .limit(objectPagination.limitItems)
      .skip(objectPagination.skip)
      .lean();

    // item and color respectively
    for (const item of tasks) {
      const data = await Promise.all([
        Status.findOne({
          _id: item.status_id,
          deleted: false,
        }),
        Prioriry.findOne({
          _id: item.priority_id,
          deleted: false,
        }),
      ]);

      const [status, priority] = data;

      if (status) {
        const color = await Color.findOne({
          _id: status.color_id,
          deleted: false,
        });
        if (color) {
          item.statusColor = color.hex;
        }
        item.status = status.title;
      }

      if (priority) {
        const color = await Color.findOne({
          _id: priority.color_id,
          deleted: false,
        });
        if (color) {
          item.priorityColor = color.hex;
        }
        item.priority = priority.title;
      }
    }

    res.json({
      code: 200,
      message: "Successfully",
      data: tasks,
      totalFilter: totalRecord,
      totalTask: totalTask,
    });
  } catch (error) {
    res.json({
      code: 500,
      message: "An error occurred " + error,
    });
  }
};

//[GET] /api/v1/tasks/detail/:id
module.exports.detail = async (req, res) => {
  try {
    const id = req.params.id;
    const task = await Task.findOne({ _id: id, deleted: false }).lean();

    if (!task) {
      res.json({
        code: 404,
        message: "Không tìm thấy bản ghi",
      });
      return;
    }

    const status = await Status.findOne({
      _id: task.status_id,
      deleted: false,
    });
    if (status) {
      const color = await Color.findOne({
        _id: status.color_id,
        deleted: false,
      });
      if (color) {
        task.statusColor = color.hex;
      }
      task.status = status.title;
    }

    const priotity = await Prioriry.findOne({
      _id: task.priority_id,
      deleted: false,
    });
    if (priotity) {
      const color = await Color.findOne({
        _id: priotity.color_id,
        deleted: false,
      });
      if (color) {
        task.priorityColor = color.hex;
      }
      task.priority = priotity.title;
    }

    const userCreate = await User.findOne({
      _id: task.user_id,
      deleted: false,
    }).select("_id email fullname avatar");
    if (userCreate) {
      task.userCreate = userCreate;
    }

    res.json({
      code: 200,
      message: "Successfully",
      data: task,
    });
  } catch (error) {
    res.json({
      code: 500,
      message: "An error occurred " + error,
    });
  }
};

//[PATCH] /api/v1/tasks/change-status/:id
module.exports.changeStatus = async (req, res) => {
  try {
    const taskId = req.params.id;
    const status_id = req.body.status_id;
    const body = {
      status_id: status_id,
    };

    const userRequest = req.user;

    const task = await Task.findOne({ _id: taskId, deleted: false });
    if (!task) {
      res.json({
        code: 404,
        message: "Record not found!",
      });
      return;
    }

    const status = await Status.findOne({ _id: status_id, deleted: false });
    if (status && status.key === "completed") {
      body.completedAt = new Date().toISOString();

      //notify
      const _io = socket.getIo();
      const listUser = task.listUser;
      if (listUser && listUser.length > 0) {
        for (const userId of listUser) {
          if (userId === String(userRequest._id)) {
            continue;
          }
          const notify = new Notify({
            task_id: taskId,
            title: "Completed task",
            user_id: userId,
          });
          _io.emit("SERVER_RETURN_UPDATE_STATUS_TASK", notify);
          await notify.save();
        }
        if (String(userRequest._id) !== task.user_id) {
          const notify = new Notify({
            task_id: taskId,
            title: "Completed task",
            user_id: task.user_id,
          });
          _io.emit("SERVER_RETURN_UPDATE_STATUS_TASK", notify);
          await notify.save();
        }
      }
    }
    await Task.updateOne({ _id: taskId }, body);
    res.json({
      code: 200,
      message: "Successfully",
    });
  } catch (error) {
    res.json({
      code: 400,
      message: "Không tìm thấy bản ghi!",
    });
  }
};

//[PATCH] api/v1/tasks/change-multi
module.exports.changeMulti = async (req, res) => {
  try {
    const ids = req.body.ids;
    const key = req.body.key;

    switch (key) {
      case "status":
        const value = req.body.value;
        await Task.updateMany({ _id: { $in: ids } }, { status: value });
        break;
      case "delete-all":
        await Task.updateMany(
          { _id: { $in: ids } },
          { deleted: true, deletedAt: new Date() }
        );
        break;
      default:
        res.json({
          code: 400,
          message: "Không hợp lệ!",
        });
        break;
    }
    res.json({
      code: 200,
      message: "Successfully",
    });
  } catch (error) {
    res.json({
      code: 400,
      message: "An error occurred! " + error,
    });
  }
};

//[POST] /api/v1/tasks/create
module.exports.create = async (req, res) => {
  try {
    const user = req.user;
    req.body.user_id = String(user._id);

    const task = new Task(req.body);
    await task.save();

    //notify
    const _io = socket.getIo();

    const listUser = task.listUser;
    for (const id of listUser) {
      const notify = new Notify({
        user_id: id,
        title: "Create new task",
        task_id: task.id,
      });

      _io.emit("SERVER_RETURN_CREATE_NEW_TASK", notify);
      await notify.save();
    }

    res.json({
      code: 200,
      message: "Create new successfully!",
      data: task,
    });
  } catch (error) {
    console.log(error);
    res.json({
      code: 500,
      message: "An error occurred in server " + error,
    });
  }
};

//[PATCH] /api/v1/tasks/edit/:id
module.exports.edit = async (req, res) => {
  try {
    const taskId = req.params.id;
    const status_id = req.body.status_id;
    const status = await Status.findOne({ _id: status_id, deleted: false });
    const userRequest = req.user;
    const task = await Task.findOne({ _id: taskId }).lean();

    if (!task) {
      res.json({
        code: 404,
        message: "Record not found!",
      });
      return;
    }

    const listUser = task.listUser;
    const _io = socket.getIo();
    if (status && status_id !== task.status_id && status.key === "completed") {
      req.body.completedAt = new Date().toISOString();

      //notify

      if (listUser && listUser.length > 0) {
        for (const userId of listUser) {
          if (userId === String(userRequest._id)) {
            continue;
          }
          const notify = new Notify({
            task_id: taskId,
            title: "Completed task",
            user_id: userId,
          });
          _io.emit("SERVER_RETURN_UPDATE_STATUS_TASK", notify);
          await notify.save();
        }
        if (String(userRequest._id) !== task.user_id) {
          const notify = new Notify({
            task_id: taskId,
            title: "Completed task",
            user_id: task.user_id,
          });
          _io.emit("SERVER_RETURN_UPDATE_STATUS_TASK", notify);
          await notify.save();
        }
      }
    }

    //notify for invited and disqualified user
    const currentListUser = task.listUser;
    const listUserRequest = req.body.listUser;

    for (const requestId of listUserRequest) {
      const exist = currentListUser.includes(requestId);
      if (!exist) {
        const notify = new Notify({
          title: "You are invited to join task",
          task_id: taskId,
          user_id: requestId,
        });
        _io.emit("SERVER_RETURN_UPDATE_USER_TASK", notify);
        await notify.save();
      }
    }

    for (const currentId of currentListUser) {
      const exist = listUserRequest.includes(currentId);
      if (!exist) {
        const notify = new Notify({
          title: "You have been disqualified from task",
          task_id: taskId,
          user_id: currentId,
        });
        _io.emit("SERVER_RETURN_UPDATE_USER_TASK", notify);
        await notify.save();
      }
    }

    await Task.updateOne({ _id: taskId }, req.body);

    res.json({
      code: 200,
      message: "Update Successfully",
    });
  } catch (error) {
    res.json({
      code: 400,
      message: "An error occurred! " + error,
    });
  }
};

//[DELETE] /api/v1/tasks/:id
module.exports.delete = async (req, res) => {
  try {
    const id = req.params.id;
    await Task.updateOne({ _id: id }, { deleted: true, deletedAt: new Date() });
    res.json({
      code: 200,
      message: "Successfully",
    });
  } catch (error) {
    res.json({
      code: 400,
      message: "An error occurred! " + error,
    });
  }
};
