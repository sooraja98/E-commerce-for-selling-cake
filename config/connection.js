const mongoose = require("mongoose");

mongoose.set('strictQuery', true);
mongoose.connect('mongodb://127.0.0.1:27017/e-com', { useNewUrlParser: true, useUnifiedTopology: true });


const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));

db.once("open", function() {
  console.log("Connection Successful!");
});