const mongoose = require('mongoose')

let wishSchema=new mongoose.Schema({
    userId : {
        type: mongoose.Types.ObjectId,
        ref : 'user'
    },
    productId : [{
        
            type:mongoose.Types.ObjectId,
            ref:'product'
      
    }],
})
const Wish = mongoose.model("wish", wishSchema);
module.exports = Wish;
