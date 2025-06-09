const express = require("express");
require("dotenv").config();
const bodyParser = require("body-parser");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const http = require("http");

const routeVersion1 = require("./api/v1/routes/index.route");

//connect database
const database = require("./config/database");
database.connect();

const app = express();
const server = http.createServer(app);
const { Server } = require("socket.io");
const socket = require("./socket");

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

socket.connet(io);

//cookie
app.use(cookieParser());

//backend blocked all
app.use(cors());

// parse application/json
app.use(bodyParser.json());

//routeVersion1
routeVersion1(app);

server.listen(process.env.PORT, (err) => {
  if (err) {
    console.log(err);
  } else {
    console.log("server is running at port " + process.env.PORT);
  }
});
