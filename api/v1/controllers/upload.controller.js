//[POST] /api/v1/upload/task
module.exports.post = async (req, res) => {
  try {
    const url = req.body[req.file.fieldname];
    res.json({
      code: 200,
      message: "Upload successfully",
      imageUrl: url,
    });
  } catch (error) {
    res.json({
      code: 500,
      message: "An error occurred " + error,
    });
  }
};
