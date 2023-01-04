const mongoose = require("mongoose");
require("../config/connection");
const coupanSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  offer: { type: Number },
  startdate: { type: Date },
  enddate: { type: Date },
  status: {
    type: Boolean,
    default: true,
  },
});

const Coupan = mongoose.model("coupan", coupanSchema);



module.exports = Coupan;
