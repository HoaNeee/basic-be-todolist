const mongoose = require("mongoose");

module.exports.connect = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("connect to mongodb success");
  } catch (error) {
    console.log("connect to mongodb failed");
  }
};
