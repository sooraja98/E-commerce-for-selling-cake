const mongoose=require('mongoose');

const { Schema } = mongoose;
const orderSchema = new Schema({
   
    userId:{
        type:mongoose.SchemaTypes.ObjectId,
        ref:'User'
    },
    product:{type:Array},
    addresses:mongoose.SchemaTypes.ObjectId,
    status:{
        type:String,
        default:'Placed',
    },
    date:{type:Date,
        default:Date.now()
    },
    total:{
        type:Number
    },
   
  
});




const Order = mongoose.model('order', orderSchema);

module.exports=Order;