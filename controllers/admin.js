const User = require("../model/schema");
const coupan=require('../model/coupan')
const session=require('express-session')

module.exports={
    userview:async(req,res)=>{
            const userList=await User.find({});
            console.log(userList)
            res.render("admin/partials/user",{customer:userList})
    },

    adminsession:(req,res,next)=>{
            try{
                if(req.session.admin){}
        else{
            res.redirect("admin")
        }
        next()
            }
            catch(err){
                console.log("error in is admin session"+err);
           }
    }
}
