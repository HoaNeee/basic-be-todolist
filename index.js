const express = require("express");
require("dotenv").config();
const bodyParser = require("body-parser");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const routeVersion1 = require("./api/v1/routes/index.route");

//connect database
const database = require("./config/database");
database.connect();

const app = express();

//cookie
app.use(cookieParser());

//backend blocked all
app.use(cors());

// parse application/json
app.use(bodyParser.json());

//routeVersion1
routeVersion1(app);

app.listen(process.env.PORT, (err) => {
  if (err) {
    console.log(err);
  } else {
    console.log("server is running at port " + process.env.PORT);
  }
});
