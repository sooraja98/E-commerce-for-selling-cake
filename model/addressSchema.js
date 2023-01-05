const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const addressSchema = new Schema({
  user_id: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  pincode: {
    type: Number,
    required: true,
  },
});
const Address = mongoose.model("address", addressSchema);
module.exports = Address;
