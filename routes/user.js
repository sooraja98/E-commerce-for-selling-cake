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
const Address = require("../model/addressSchema");
const Wish = require("../model/wishSchema");
const userCheck=require('../controllers/userCheck')
var paypal = require("paypal-rest-sdk");
paypal.configure({
  mode: "sandbox", //sandbox or live
  client_id:
    "AfFNd2qFDc9rtgtrLA9YQO3Hcs2Tueav6iVlrZTvDPzT8oNNLWcQkzGFFmd_pcALKeBanIpZYky3mirA",
  client_secret:
    "ECe3UMFpNHcJOcqPPZBj-18EZQTJyt5BrGjg10us99wNueLJW1NGw3lYEEKYJ8GCWICwU1XgFkvmANQ6",
});


/* GET home page. */
router.get("/", userController.home);
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

router.get("/usercategory",userController.usercategory);

router.get("/ToCart", userSession.iSLogin, userController.ToCart);

router.get("/addToCart", userController.addToCart);

router.post("/resend-otp", userController.resendOtp);

router.post("/resendSignup-otp", userController.resendSignupOtp);

router.get("/shop", userController.shop);

router.get("/profile", userSession.iSLogin,userCheck.iSValid,userController.profile);

router.get("/userProductView", userController.userProductView);

router.get("/cartRemove", userController.catRemove);

router.get("/cartIncrement", userController.cartIncrement);

router.get("/cartDecrement", userController.cartDecrement);

router.get("/add-address", userSession.iSLogin, async (req, res) => {
  res.render("user/partials/add-address", { userId: req.session.userId });
});

router.post("/add-address", userSession.iSLogin, userController.addAddress);

router.get("/changeProfile", userSession.iSLogin, userController.changeProfile);
router.post(
  "/changeProfileData",
  userSession.iSLogin,
  userController.changeProfileData
);

router.get("/checkout", userSession.iSLogin, async (req, res) => {
  const total = req.query.total;
  const userEmail = await User.findById({ _id: req.session.userId });
  const email = userEmail.email;
  const address = await Address.find({ user_id: email });
  res.render("user/partials/checkout", { total: total, address: address });
});

router.get("/addwishlist", userSession.iSLogin,userController.addWishlist)

router.get("/wishlist", userSession.iSLogin,async (req, res) => {
  const userId = req.session.userId;
  const wish = await Wish.findOne({ userId: userId }).populate("productId");
  res.render("user/partials/wishlist", {
    usersession: req.session.username,
    userId: req.session.userId,
    wish: wish,
  });
});


router.get("/deleteWish", userSession.iSLogin, async (req, res) => {
  const userId = req.query.userId;
  const productId = req.query.productId;
  const remove = await Wish.updateOne(
    { userId: userId },
    {
      $pull: { productId: mongooes.Types.ObjectId(productId) },
    }
  );
  res.redirect("shop");
});

router.post("/payment",userSession.iSLogin,(req, res) => {
  const create_payment_json = {
    intent: "sale",
    payer: {
      payment_method: "paypal",
    },
    redirect_urls: {
      return_url: "http://localhost:5000",
      cancel_url: "http://localhost:5000/shop"
    },
    transactions: [
      {
        item_list: {
          items: [
            {
              name: "Red Sox Hat",
              sku: "001",
              price: "25.00",
              currency: "USD",
              quantity: 1,
            },
          ],
        },
        amount: {
          currency: "USD",
          total: "25.00",
        },
        description: "Hat for the best team ever",
      },
    ],
  };

  paypal.payment.create(create_payment_json, function (error, payment) {
    if (error) {
      throw error;
    } else {
      for (let i = 0; i < payment.links.length; i++) {
        if (payment.links[i].rel === "approval_url") {
          res.redirect(payment.links[i].href);
        }
      }
    }
  });
});

router.get("/success", (req, res) => {
  const payerId = req.query.PayerID;
  const paymentId = req.query.paymentId;

  const execute_payment_json = {
    payer_id: payerId,
    transactions: [
      {
        amount: {
          currency: "USD",
          total: "25.00",
        },
      },
    ],
  };

  paypal.payment.execute(
    paymentId,
    execute_payment_json,
    function (error, payment) {
      if (error) {
        console.log(error.response);
        throw error;
      } else {
        console.log(JSON.stringify(payment));
        res.send("Success");
      }
    }
  );
});


router.get("/generate", (req, res) => {
  const html = fs.readFileSync(
    path.join(__dirname, "./views/template.html"),
    "utf-8"
  );
  const filename = Math.random() + "_doc" + ".pdf";
  const filepath = "/localhost:1000/docs/" + filename;
  const details = [
    { name: "jithin", age: 26 },
    { name: "alan", age: 21 },
  ];

  const document = {
    html: html,
    data: { details },
    path: "./docs/" + filename,
  };
  pdf
    .create(document)
    .then((resolve) => {
      console.log(resolve);
      // res.render('./downloadpage',{path:filepath})
    })
    .catch((err) => {
      console.log(err);
    });
  res.render("./downloadpage", { path: filepath });
});


router.get("/order",userSession.iSLogin,(req,res)=>{
  res.render('user/partials/order')
} );


module.exports = router;
