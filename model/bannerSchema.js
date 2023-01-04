const mongoose = require("mongoose");
require("../config/connection");
const bannerSchema = new mongoose.Schema({
  name: String,
  image: String,
  list: {
    type: Boolean,
    default: true,
  },
});

const Banner = mongoose.model("banner", bannerSchema);
module.exports = Banner;
