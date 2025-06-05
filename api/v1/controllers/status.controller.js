const Status = require("../model/status.model");
const Color = require("../model/color.model");

// [GET] /api/v1/status
module.exports.status = async (req, res) => {
  const records = await Status.find({ deleted: false }).lean();
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
};

// [POST] /api/v1/status/create
module.exports.create = async (req, res) => {
  try {
    const key = req.body.key;
    const existStatus = await Status.findOne({ key: key, deleted: false });
    if (existStatus) {
      res.json({
        code: 400,
        message: "Trạng thái đã tồn tại",
      });
      return;
    }
    const status = new Status(req.body);
    await status.save();
    res.json({
      code: 200,
      message: "Create successfully",
      data: status,
    });
  } catch (error) {
    res.json({
      code: 500,
      message: "An error occurred " + error,
    });
  }
};

// [PATCH] /api/v1/status/edit/:id
module.exports.edit = async (req, res) => {
  try {
    const key = req.body.key;
    const id = req.params.id;
    const existStatus = await Status.findOne({
      _id: { $ne: id },
      key: key,
      deleted: false,
    });
    if (existStatus) {
      res.json({
        code: 400,
        message: "Trạng thái đã tồn tại",
      });
      return;
    }
    await Status.updateOne({ _id: id }, req.body);
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

// [DELETE] /api/v1/status/delete/:id
module.exports.delete = async (req, res) => {
  try {
    const id = req.params.id;

    await Status.updateOne(
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
