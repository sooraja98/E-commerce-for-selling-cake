const mongoose = require("mongoose");
require("../config/connection");
const categorySchema = new mongoose.Schema({
  name: String,
  image: String,
  list: {
    type: Boolean,
    default: true,
  },
});

const Category = mongoose.model("category", categorySchema);
module.exports = Category;
