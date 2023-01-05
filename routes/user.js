var express = require("express");
var router = express.Router();
var mongodb = require("mongodb");
var bcrypt = require("bcrypt");
require("../config/connection");
var User = require("../model/schema");
const userController = require("../controllers/user");
const { Router } = require("express");
const userSession = require("../middileware/userLogin");
const { clearCache, render } = require("ejs");
const Product = require("../model/productSchema");
const Category = require("../model/category");
const Cart = require("../model/cart");
const mongooes = require("mongoose");
const user = require("../controllers/user");
const { iSLogin } = require("../middileware/userLogin");
const session = require("express-session");
const { login } = require("../controllers/user");
const Address=require('../model/addressSchema')
const Wish=require('../model/wishSchema')

/* GET home page. */
router.get("/",userController.home);
router.get("/user-login", (req, res) => {
  res.render("user/partials/user-login");
});

//User signup
router.post("/user-signup", userController.registeruser);
router.post("/user-login", userController.login);
router.get("/user-login/otpverification", (req, res) => {
  res.render("user/partials/otpverification");
});
router.post("/user-login/otpverification", userController.otpverfication);

//forgott password
router.get("/user-login/forgotpassword", (req, res) => {
  res.render("user/partials/forgotpassword");
});
router.post("/user-login/forgotpassword", userController.forgotpassword);

router.get("/user-login/forgotpassword/forgotpassword-otp", userController.forgotpasswordOtp);
router.post( "/user-login/forgotpassword/forgotpassword-otp",userController.forgototp);

router.get("/user-login/changepassword",userController.changepassword);

router.post("/user-login/changepassword/resendEmail",userController.passwordchange);

router.get("/user-logout",userController.logout)

router.get("/usercategory",userController.usercategory);

router.get("/ToCart", userSession.iSLogin,userController.ToCart,);

router.get("/addToCart",userController.addToCart);


router.post("/resend-otp",userController.resendOtp);

router.post("/resendSignup-otp",userController.resendSignupOtp);

router.get("/shop",userController.shop,);

router.get("/profile", userSession.iSLogin,userController.profile);



router.get("/userProductView",userController.userProductView);

router.get("/cartRemove",userController.catRemove);

router.get("/cartIncrement",userController.cartIncrement);

router.get("/cartDecrement",userController.cartDecrement );


router.get('/add-address',userSession.iSLogin,async(req,res)=>{
    res.render("user/partials/add-address",{userId:req.session.userId})     
})

router.post('/add-address',userSession.iSLogin,userController.addAddress)

router.get('/changeProfile',userSession.iSLogin,userController.changeProfile)
router.post("/changeProfileData", userSession.iSLogin,userController.changeProfileData);


router.get("/checkout",userSession.iSLogin,async (req, res) => {
        const total=req.query.total
        const userEmail= await User.findById({_id:req.session.userId})
        const email=userEmail.email
        const address=await Address.find({user_id:email});
  res.render("user/partials/checkout",{total:total,address:address});
});

router.get("/wishlist",userSession.iSLogin,async (req, res) => {
res.render("user/partials/wishlist",{
  usersession: req.session.username,
  userId: req.session.userId,
});
});

router.get("/wishlist",userSession.iSLogin,async (req, res) => {
      const productId=req.query.productId
      const userId=req.query.userId
      console.log("==========================================================="+rstproductId,userId)
      const user=await Wish.findOne({userId:userId}) 
      console.log("=================================================="+user);
    if(user){

    }
    else{
      console.log("wishsacve");
        const wishobj =new Wish({
          userId:userId,
          wishItem:[{productId:productId}]
        }) 
        await wishobj.save()
    }

  res.render("user/partials/wishlist")
  });





module.exports = router;
















