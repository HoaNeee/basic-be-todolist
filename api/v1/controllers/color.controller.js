const Color = require("../model/color.model");

// [GET] /api/v1/colors
module.exports.colors = async (req, res) => {
  const records = await Color.find({ deleted: false });
  res.json({
    code: 200,
    message: "Successfully",
    data: records,
  });
};

// [POST] /api/v1/colors/create
module.exports.create = async (req, res) => {
  try {
    const hex = req.body.hex;
    const existHex = await Color.findOne({ hex: hex, deleted: false });
    if (existHex) {
      res.json({
        code: 400,
        message: "Mã màu đã tồn tại!",
      });
      return;
    }
    const color = new Color(req.body);
    await color.save();
    res.json({
      code: 200,
      message: "Successfully",
      data: color,
    });
  } catch (error) {
    res.json({
      code: 500,
      message: "An error occurred " + error,
    });
  }
};

// [PATCH] /api/v1/colors/edit/:id
module.exports.edit = async (req, res) => {
  try {
    const id = req.params.id;

    const hex = req.body.hex;
    const existHex = await Color.findOne({ _id: { $ne: id }, hex: hex });
    if (existHex) {
      res.json({
        code: 400,
        message: "Mã màu đã tồn tại!",
      });
      return;
    }
    await Color.updateOne({ _id: id }, req.body);
    res.json({
      code: 200,
      message: "Successfully",
    });
  } catch (error) {
    res.json({
      code: 500,
      message: "An error occurred " + error,
    });
  }
};

// [DELETE] /api/v1/colors/delete/:id
module.exports.delete = async (req, res) => {
  try {
    const id = req.params.id;

    await Color.updateOne(
      { _id: id },
      { deleted: true, deletedAt: new Date() }
    );
    res.json({
      code: 200,
      message: "Successfully",
    });
  } catch (error) {
    res.json({
      code: 500,
      message: "An error occurred " + error,
    });
  }
};

//[GET] /api/v1/colors/undo-delete
module.exports.undo = async (req, res) => {
  try {
    const id = req.params.id;
    await Color.updateOne({ _id: id }, { deleted: false, deletedAt: 0 });
    res.json({
      code: 200,
      message: "Undo Successfully",
    });
  } catch (error) {
    res.json({
      code: 500,
      message: "An error occurred " + error,
    });
  }
};
