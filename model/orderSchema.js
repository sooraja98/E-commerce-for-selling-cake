const mongoose=require('mongoose')

const orderSchema=new mongoose.Schema({
    userId:mongoose.Types.ObjectId,
    products:[{productId:mongoose.Types.ObjectId,quantity:Number}],
    couponsApplied:[{coupenId:mongoose.Types.ObjectId}],
    netAmount:Number,
    address:{houseName:String, village:String, pin:Number, state:String, country:String},
    status:{ type:String,default:'processing'},
    orderDate:String,
    expectedDeliveryDate:String
})

const Order=new mongoose.model('order',newSchema)

module.exports=Order