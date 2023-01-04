const User = require("../model/schema");
const coupan=require('../model/coupan')
const session=require('express-session')

module.exports={
    userview:async(req,res)=>{
            const userList=await User.find({});
            console.log(userList)
            res.render("admin/partials/user",{customer:userList})
    } ,  

    coupenchecker:async(req,res)=>{
        
    },
    adminsession:(req,res,next)=>{
            req.session.admin=true
            if(req.session.admin){
            next()
            }
        else{
            res.redirect("/admin/admin-home")
        }
    }
}