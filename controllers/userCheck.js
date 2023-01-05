const User=require('../model/schema')
   


module.exports={

    iSValid:async(req,res,next)=>{
           try{
            const user=await User.findById({_id:req.session.userId})
            const userCheck=user.verified
                if(userCheck)
                    {}
                    else{
                        res.redirect("/")
                    }
                    next()
           }
           catch(err){
                console.log("error in is Login"+err);
           }
    }

}