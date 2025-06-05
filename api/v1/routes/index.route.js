const taskRoute = require("./task.route");
const userRoute = require("./user.route");
const colorRoute = require("./color.route");
const statusRoute = require("./status.route");
const priorityRoute = require("./priority.route");
const uploadRoute = require("../routes/upload.route");

const authMiddleware = require("../../../middleware/auth.middleware");

module.exports = (app) => {
  const version = "/api/v1";
  app.use(version + "/tasks", authMiddleware.requireAuth, taskRoute);
  app.use(version + "/colors", authMiddleware.requireAuth, colorRoute);
  app.use(version + "/status", authMiddleware.requireAuth, statusRoute);
  app.use(version + "/priority", authMiddleware.requireAuth, priorityRoute);
  app.use(version + "/upload", authMiddleware.requireAuth, uploadRoute);
  app.use(version + "/users", userRoute);
};
