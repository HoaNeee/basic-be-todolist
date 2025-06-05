const Task = require("../model/task.model");
const Status = require("../model/status.model");
const Prioriry = require("../model/prority.model");
const Color = require("../model/color.model");

const paginationHelper = require("../../../helpers/pagination");
const searchHelper = require("../../../helpers/search");

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

    for (const item of tasks) {
      const status = await Status.findOne({
        _id: item.status_id,
        deleted: false,
      });

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
      const priotity = await Prioriry.findOne({
        _id: item.priority_id,
        deleted: false,
      });
      if (priotity) {
        const color = await Color.findOne({
          _id: priotity.color_id,
          deleted: false,
        });
        if (color) {
          item.priorityColor = color.hex;
        }
        item.priority = priotity.title;
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
    res.josn({
      code: 400,
      message: "An error occurred " + error,
    });
  }
};

//[GET] /api/v1/tasks/detail/:id
module.exports.detail = async (req, res) => {
  try {
    const id = req.params.id;
    const task = await Task.findOne({ _id: id, deleted: false }).lean();

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

    if (!task) {
      res.json({
        code: 400,
        message: "Không tìm thấy bản ghi",
      });
      return;
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
    const id = req.params.id;
    const status = req.body.status;
    await Task.updateOne({ _id: id }, { status: status });
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
    // console.log(req.body);
    const task = new Task(req.body);
    await task.save();
    res.json({
      code: 200,
      message: "Create new successfully!",
      data: task,
    });
  } catch (error) {
    res.json({
      code: 400,
      message: "An error occurred! " + error,
    });
  }
};

//[PATCH] /api/v1/tasks/edit/:id
module.exports.edit = async (req, res) => {
  try {
    const id = req.params.id;
    await Task.updateOne(
      {
        _id: id,
      },
      req.body
    );
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
