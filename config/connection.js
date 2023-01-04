const mongoose = require("mongoose");

mongoose.set('strictQuery', true);
mongoose.connect("mongodb://localhost:27017/cake", {
  useUnifiedTopology: true,
  useNewUrlParser: true
});

var db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));

db.once("open", function() {
  console.log("Connection Successful!");
});