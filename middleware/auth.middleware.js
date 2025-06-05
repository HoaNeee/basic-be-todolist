const User = require("../api/v1/model/user.model");

module.exports.requireAuth = async (req, res, next) => {
  try {
    if (req.headers.authorization) {
      const token = req.headers.authorization.split(" ")[1];
      const user = await User.findOne({ token: token, deleted: false }).select(
        "-password -token -deleted"
      );
      if (!user) {
        res.json({
          code: 404,
          message: "User not found!",
        });
        return;
      }
      req.user = user;
      next();
    } else {
      res.json({
        code: 400,
        message: "Vui lòng gửi kèm theo token",
      });
      return;
    }
  } catch (error) {
    res.json({
      code: 400,
      message: "An error occurred " + error,
    });
    return;
  }
};
