require("dotenv").config();
const express = require("express");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const passport = require("passport");
const cors = require("cors");
const { spawnSync, spawn } = require("child_process");
const mongoose = require("mongoose");
const routes = require("./routes/index");
const path = require("path");
const ApiResponse = require("./middlewares/ApiResponse");

mongoose
  .connect(
    "mongodb+srv://admin:admin@cluster0.wdfuc.mongodb.net/interns?retryWrites=true&w=majority",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => {
    console.log("Database up");
    app.listen(process.env.PORT || 5002, () => {
      console.log("running on 5002");

      const cornJob = spawn("node", ["utils/Scripts/cornJob"]);

      cornJob.stdout.on("data", (data) => {
        console.log(`stdout: ${data}`);
      });

      cornJob.stderr.on("data", (data) => {
        console.error(`stderr: ${data}`);
      });

      cornJob.on("close", (code) => {
        console.log(`child process exited with code ${code}`);
      });

      cornJob.on("error", (err) => {
        console.error("Failed to start subprocess.", err);
      });
    });
  })
  .catch((err) => console.log("Database conncection errors", err.message));
const app = express();
const store = new MongoDBStore({
  uri: process.env.DB_URI,
  collection: "mySessions",
});
// Middlewares
app.use(ApiResponse);
app.use(express.json({ limit: "50mb" }));
app.use(
  express.urlencoded({ limit: "50mb", extended: true, parameterLimit: 100000 })
);
app.use(
  session({
    secret: process.env.SECRET,
    cookie: { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: false },
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);
app.use(
  cors({
    origin: [
      "http://localhost:5000",
      "http://127.0.0.1:5500",
      "https://dev.predictram.com",
      "https://predictram.com",
      "https://predictram-beta.azurewebsites.net",
    ],
    credentials: true,
    allowedHeaders: "*",
  })
);
app.use(passport.initialize());
app.use(passport.session());
require("./auth/passportConfig")(passport);
app.use(routes);
