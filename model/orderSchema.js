const mongoose=require('mongoose');

const { Schema } = mongoose;
const orderSchema = new Schema({
   
    userId:{
        type:mongoose.SchemaTypes.ObjectId,
        ref:'User'
    },
    product:{},
    addresses:[{
        address:String,
        phone:String,
        city:String,
        pincode:String,
        }],
    status:{
        type:String,
        default:'Placed',
    },
    date:{
        default:Date.now
    },
    total:{
        type:String
    },
   
  
});




const Order = mongoose.model('order', orderSchema);

module.exports=Order;