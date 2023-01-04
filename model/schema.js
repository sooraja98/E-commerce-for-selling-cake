const mongoose = require("mongoose");
const Product = require("./productSchema");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  mobile: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  verified: {
    type: Boolean,
    default: true,
  },
  address: [
    {
      name: String,
      addressline1: String,
      addressline2: String,
      district: String,
      state: String,
      country: String,
      pin: Number,
      mobile: Number,
      status: {
        type: Boolean,
        default: false,
      },
    },
  ],
});

var User = mongoose.model("user", userSchema);
module.exports = User;
