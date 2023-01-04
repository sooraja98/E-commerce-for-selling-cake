const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const category=require('./category')

const productSchema = new Schema({
    name: {
      type: String,
    },
    category: {
      type:mongoose.Types.ObjectId,
      ref:"category"
    },
    description: {
      type: String,
    },
    price: {
      type: Number,
    },
    image: {
      type: String,
    },
    list:{
        type:Boolean,
        default:true
    }
  });
  

var Product = mongoose.model("product", productSchema);
module.exports = Product;