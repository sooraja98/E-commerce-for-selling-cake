const mongoose = require('mongoose')

let cartSchema=new mongoose.Schema({
    userId : {
        type: mongoose.Types.ObjectId,
        ref : 'user'
    },
    cartItem : [{
        productId:{
            type:mongoose.Types.ObjectId,
            ref:'product'
        },
        qty:{
            type:Number,
            required:true
        }
    }],
})
const Cart = mongoose.model("cart", cartSchema);
module.exports = Cart;
