const express = require("express");
const router = express.Router();
const mongodb = require("mongodb");
const bcrypt = require("bcrypt");
require("../config/connection");
const User = require("../model/schema");
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
const { login, userProductView } = require("../controllers/user");
const Address = require("../model/addressSchema");
const Wish = require("../model/wishSchema");
const userCheck = require("../controllers/userCheck");
const paypal = require("paypal-rest-sdk");
const Coupan = require("../model/coupan");
const Order = require("../model/orderSchema");

paypal.configure({
  mode: "sandbox", // sandbox or live
  client_id:
    "AfFNd2qFDc9rtgtrLA9YQO3Hcs2Tueav6iVlrZTvDPzT8oNNLWcQkzGFFmd_pcALKeBanIpZYky3mirA",
  client_secret:
    "ECe3UMFpNHcJOcqPPZBj-18EZQTJyt5BrGjg10us99wNueLJW1NGw3lYEEKYJ8GCWICwU1XgFkvmANQ6",
});

/* GET home page. */
router.get("/", userController.home);
router.get("/user-login", userController.login);
// User signup
router.post("/user-signup", userController.registeruser);
router.post("/user-login", userController.login);
router.get("/user-login/otpverification", userController.otpverfication);
router.post("/user-login/otpverification", userController.otpverfication);
// forgott password
router.get("/user-login/forgotpassword", userController.forgotpassword);
router.post("/user-login/forgotpassword", userController.forgotpassword);
router.get(
  "/user-login/forgotpassword/forgotpassword-otp",
  userController.forgotpasswordOtp
);
router.post(
  "/user-login/forgotpassword/forgotpassword-otp",
  userController.forgototp
);
router.get("/user-login/changepassword", userController.changepassword);
router.post(
  "/user-login/changepassword/resendEmail",
  userController.passwordchange
);
router.get("/user-logout", userController.logout);
router.get("/usercategory", userController.usercategory);
router.get("/ToCart", userSession.iSLogin, userController.ToCart);
router.get("/addToCart", userController.addToCart);
router.post("/resend-otp", userController.resendOtp);
router.post("/resendSignup-otp", userController.resendSignupOtp);
router.get("/shop", userController.shop);
router.get(
  "/profile",
  userSession.iSLogin,
  userCheck.iSValid,
  userController.profile
);
router.get("/userProductView", userController.userProductView);
router.get("/cartRemove", userController.catRemove);
router.get("/cartIncrement", userController.cartIncrement);
router.get("/cartDecrement", userController.cartDecrement);
router.get("/add-address", userSession.iSLogin, userController.getaddaddress);
router.post("/add-address", userSession.iSLogin, userController.addAddress);
router.get("/changeProfile", userSession.iSLogin, userController.changeProfile);
router.post(
  "/changeProfileData",
  userSession.iSLogin,
  userController.changeProfileData
);
router.post("/checkout", userSession.iSLogin, userController.checkout);
router.get("/addwishlist", userSession.iSLogin, userController.addWishlist);
router.get("/wishlist", userSession.iSLogin, userController.wishlist);
router.get("/deleteWish", userSession.iSLogin, userController.deletewishlist);
router.post("/payment", userSession.iSLogin, userController.payment);
router.get("/success", userController.paymentsuccessful);
router.get("/more", userController.paymentmore);
router.get("/less", userController.paymentmore);
router.get("/order", userSession.iSLogin, userController.orderget);
router.patch("/couponcheck", userController.coupancheck);
module.exports = router;
