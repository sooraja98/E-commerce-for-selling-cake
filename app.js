const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const mongoose = require("mongoose");
require("./config/connection");
mongoose.set("strictQuery", false);
const session = require("express-session");
const adminRouter = require("./routes/admin");
const userRouter = require("./routes/user");
const paypal = require("paypal-rest-sdk");
paypal.configure({
  mode: "sandbox", //sandbox or live
  client_id:
    "AfFNd2qFDc9rtgtrLA9YQO3Hcs2Tueav6iVlrZTvDPzT8oNNLWcQkzGFFmd_pcALKeBanIpZYky3mirA",
  client_secret:
    "ECe3UMFpNHcJOcqPPZBj-18EZQTJyt5BrGjg10us99wNueLJW1NGw3lYEEKYJ8GCWICwU1XgFkvmANQ6",
});

const app = express();
const fileupload = require("express-fileupload");
app.use(
  fileupload({
    useTempFiles: true,
  })
);

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(
  session({
    secret: "keyboardcat",
    resave: true,
    saveUninitialized: true,
  })
);
paypal.configure({
  mode: "sandbox", //sandbox or live
  client_id:
    "AYdobh3BVGoRK3lEjTRSfj8Rle8rkCNarLclaQBEDQ_wzjISOcIBmec5Zby1CeBCrA5gRr6wPe98He4R",
  client_secret:
    "EB7VaKf8Lr_-J1s6nhnM_Hb1zlwwbcPYYnm9IoXYo44gcOMX44vsGAle65tDu_2v5yerfrq8m_pJr1R6",
});

app.use("/", userRouter);
app.use("/admin", adminRouter);

module.exports = app;
