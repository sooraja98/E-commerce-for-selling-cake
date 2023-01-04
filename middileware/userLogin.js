
module.exports={

        iSLogin:async(req,res,next)=>{
               try{
                    if(req.session.userId)
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