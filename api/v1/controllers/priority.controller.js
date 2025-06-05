const Priority = require("../model/prority.model");
const Color = require("../model/color.model");

// [GET] /api/v1/priority
module.exports.priority = async (req, res) => {
  try {
    const records = await Priority.find({ deleted: false }).lean();
    for (const item of records) {
      const color = await Color.findOne({ _id: item.color_id });
      if (color) {
        item.hex = color.hex;
      }
    }
    res.json({
      code: 200,
      message: "Successfully",
      data: records,
    });
  } catch (error) {
    res.json({
      code: 500,
      message: "An error occurred " + error,
    });
  }
};

// [POST] /api/v1/priority/create
module.exports.create = async (req, res) => {
  try {
    const key = req.body.key;
    const existPriority = await Priority.findOne({
      key: key,
      deleted: false,
    });
    if (existPriority) {
      res.json({
        code: 400,
        message: "Độ ưu tiên đã tồn tại",
      });
      return;
    }
    const priority = new Priority(req.body);
    await priority.save();
    res.json({
      code: 200,
      message: "Create successfully",
      data: priority,
    });
  } catch (error) {
    res.json({
      code: 500,
      message: "An error occurred " + error,
    });
  }
};

// [PATCH] /api/v1/priority/edit/:id
module.exports.edit = async (req, res) => {
  try {
    const key = req.body.key;
    const id = req.params.id;
    const existPriority = await Priority.findOne({
      _id: { $ne: id },
      key: key,
      deleted: false,
    });
    if (existPriority) {
      res.json({
        code: 400,
        message: "Độ ưu tiên đã tồn tại",
      });
      return;
    }
    await Priority.updateOne({ _id: id }, req.body);
    res.json({
      code: 200,
      message: "Update successfully",
    });
  } catch (error) {
    res.json({
      code: 500,
      message: "An error occurred " + error,
    });
  }
};

// [DELETE] /api/v1/priority/delete/:id
module.exports.delete = async (req, res) => {
  try {
    const id = req.params.id;

    await Priority.updateOne(
      { _id: id },
      { deleted: true, deletedAt: new Date() }
    );
    res.json({
      code: 200,
      message: "Delete successfully",
    });
  } catch (error) {
    res.json({
      code: 500,
      message: "An error occurred " + error,
    });
  }
};
