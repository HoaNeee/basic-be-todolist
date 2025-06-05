const uploadCloud = require("../helpers/uploadCloud");

module.exports.uploadCloud = async (req, res, next) => {
  if (req.file) {
    const result = await uploadCloud.upload(req.file.buffer);
    req.body[req.file.fieldname] = result.url;
  }

  next();
};
