const User = require("../model/user.model");
const ForgotPassword = require("../model/forgot-password.model");
const md5 = require("md5");

const generate = require("../../../helpers/generateString");
const sendMailHelper = require("../../../helpers/sendMail");

//[POST] /api/v1/users/login
module.exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email });
    if (!user) {
      res.json({
        code: 404,
        message: "Email không tồn tại",
      });
      return;
    }

    if (user.password !== md5(password)) {
      res.json({
        code: 400,
        message: "Mật khẩu không chính xác",
      });
      return;
    }

    const token = generate.string(20);

    user.token = token;

    await user.save();

    res.json({
      code: 200,
      message: "Đăng nhập thành công",
      token: token,
    });
  } catch (error) {
    res.json({
      code: 400,
      message: "An error occurred " + error,
    });
  }
};

//[POST] /api/v1/users/register
module.exports.register = async (req, res) => {
  try {
    const { email, password, fullname, avatar } = req.body;
    const existEmail = await User.findOne({ email: email, deleted: false });
    if (existEmail) {
      res.json({
        code: 400,
        message: "Email đã tồn tại",
      });
      return;
    }
    const token = generate.string(20);

    const user = new User({
      fullname,
      email,
      password: md5(password),
      avatar,
      token,
    });
    await user.save();

    res.json({
      code: 200,
      message: "Đăng ký thành công",
    });
  } catch (error) {
    res.json({
      code: 400,
      message: "An error occurred " + error,
    });
  }
};

//[GET] /api/v1/users/detail
module.exports.detail = async (req, res) => {
  try {
    res.json({
      code: 200,
      message: "Successfully",
      info: req.user,
    });
  } catch (error) {
    res.json({
      code: 400,
      message: "An error occurred " + error,
    });
  }
};

//[POST] /api/v1/users/forgot-password
module.exports.forgot = async (req, res) => {
  try {
    const email = req.body.email;
    const user = await User.findOne({ email: email, deleted: false });
    if (!user) {
      res.json({
        code: 404,
        message: "Not found user!",
      });
      return;
    }

    const otp = generate.number(6);

    const forgotPassword = new ForgotPassword({
      email: email,
      otp: otp,
      expiresAt: Date.now() + 1000 * 60 * 3,
    });

    await forgotPassword.save();

    const subject = "Xác nhận quên mật khẩu";
    const html = `Đây là mã OTP của bạn cho việc xác nhận đổi mật khẩu mới: <b>${otp}</b>. Mã xác nhận sẽ có hiệu lực trong vòng 3 phút`;

    sendMailHelper.sendMail(email, subject, html);

    res.json({
      code: 200,
      message: "OTP đã được gửi về email!",
    });
  } catch (error) {
    res.json({
      code: 400,
      message: "An error occurred " + error,
    });
  }
};

//[POST] /api/v1/users/otp
module.exports.otp = async (req, res) => {
  try {
    const otp = req.body.otp;
    const email = req.body.email;

    const record = await ForgotPassword.findOne({ email: email });
    if (!record) {
      res.json({
        code: 400,
        message: "OTP đã hết hạn",
      });
      return;
    }
    if (otp !== record.otp) {
      res.json({
        code: 400,
        message: "OTP không chính xác!",
      });
      return;
    }

    const token = generate.string(20);
    await User.updateOne({ email: email }, { token: token });

    res.json({
      code: 200,
      message: "Redirect to reset-password",
      token: token,
    });
  } catch (error) {
    res.json({
      code: 400,
      message: "An error occurred " + error,
    });
  }
};

//[POST] /api/v1/users/reset-password
module.exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    const user = await User.findOne({ token: token });

    if (!user) {
      res.json({
        code: 404,
        message: "User not found!",
      });
      return;
    }

    user.password = md5(password);
    await user.save();

    res.json({
      code: 200,
      message: "Successfully",
    });
  } catch (error) {
    res.json({
      code: 400,
      message: "An error occurred " + error,
    });
  }
};

// [GET] /api/v1/users/list-user
module.exports.listUser = async (req, res) => {
  try {
    const id = String(req.user._id);

    const users = await User.find({ _id: { $ne: id }, deleted: false }).select(
      "_id email fullname avatar"
    ); //status,...
    res.json({
      code: 200,
      message: "OK",
      data: users,
    });
  } catch (error) {
    res.json({
      code: 500,
      message: "An error occurred " + error,
    });
  }
};

// [PATCH] /api/v1/users/edit
module.exports.edit = async (req, res) => {
  try {
    const id = req.user.id;
    await User.updateOne({ _id: id }, req.body);
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

// [PATCH] /api/v1/users/change-password
module.exports.changePassword = async (req, res) => {
  try {
    const currentPassowrd = req.body["current-password"];
    const newPassowrd = req.body["new-password"];
    const confirmPassowrd = req.body["confirm-password"];

    const userId = req.user.id;

    const user = await User.findOne({ _id: userId, deleted: false });
    if (!user) {
      res.json({
        code: 404,
        message: "Not found record!",
      });
      return;
    }
    if (user.password !== md5(currentPassowrd)) {
      res.json({
        code: 400,
        message: "Current password not correct!",
      });
      return;
    }

    if (newPassowrd !== confirmPassowrd) {
      res.json({
        code: 400,
        message: "Confirm password and password not match!",
      });
      return;
    }
    user.password = md5(newPassowrd);
    await user.save();
    res.json({
      code: 200,
      message: "Change password successfully",
    });
  } catch (error) {
    res.json({
      code: 500,
      message: "An error occurred " + error,
    });
  }
};

// [POST] /api/v1/users/logout
module.exports.logout = async (req, res) => {
  try {
    const id = String(req.user._id);

    const token = generate.string(20);

    await User.updateOne({ _id: id }, { token: token });
    res.json({
      code: 200,
      message: "OK",
    });
  } catch (error) {
    res.json({
      code: 500,
      message: "An error occurred " + error,
    });
  }
};
