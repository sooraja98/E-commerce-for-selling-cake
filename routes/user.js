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
/* GET home page. */
router.get("/", async (req, res, next) => {
  let user = await User.find({ _id: req.session.userId });
  let productData = await Product.find({ list: true });
  console.log("HELO " + req.session.userId);
  res.render("user/partials/index", {
    usersession: req.session.username,
    productData: productData,
    userId: req.session.userId,
    user: user,
  });
});
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

router.get("/user-login/forgotpassword/forgotpassword-otp", (req, res) => {
  if (req.session.resetpasswordauth && req.session.otp) {
    res.render("user/partials/forgotpassword-otp");
  } else {
    res.redirect("/user-login");
  }
});
router.post(
  "/user-login/forgotpassword/forgotpassword-otp",
  userController.forgototp
);

router.get("/user-login/changepassword", (req, res) => {
  if (req.session.resetpasswordauth && req.session.passwordchange) {
    res.render("user/partials/changepassword");
  } else {
    res.redirect("/user-login");
  }
});

router.post(
  "/user-login/changepassword/resendEmail",
  userController.passwordchange
);

router.get("/user-logout", (req, res) => {
  req.session.destroy();
  res.redirect("/");
});

router.get("/changeProfileData", async (req, res) => {
  try {
  } catch (err) {
    console.log("profile" + err);
  }
});

router.get("/usercategory", async (req, res) => {
  const product = await Product.aggregate([
    {
      $lookup: {
        from: "categories",
        localField: "category",
        foreignField: "_id",
        as: "catdata",
      },
    },
    {
      $project: {
        name: "$name",
        category: "$catdata.name",
        description: "$description",
        price: "$price",
        list: "$list",
        image: "$image",
      },
    },
  ]);
  res.render("user/partials/category", {
    usersession: req.session.username,
    products: product,
  });
});

router.get("/ToCart", userSession.iSLogin, async (req, res) => {
  var userId = req.session.userId;

  const cartList = await Cart.aggregate([
    {
      $match: {
        userId: new mongooes.Types.ObjectId(userId),
      },
    },
    {
      $unwind: "$cartItem",
    },
    {
      $project: {
        productItem: "$cartItem.productId",
        qtyItem: "$cartItem.qty",
      },
    },
    {
      $lookup: {
        from: "products",
        localField: "productItem",
        foreignField: "_id",
        as: "catData",
      },
    },
    {
      $project: {
        productItem: "$productItem",
        image: "$catData.image",
        name: "$catData.name",
        price: "$catData.price",
        qty: "$qtyItem",
      },
    },
  ]);
  console.log(cartList);
  res.render("user/partials/cart", {
    cartList: cartList,
    userId: req.session.userId,
  });
});

router.get("/addToCart", async (req, res) => {
  let productId = req.query.productId;
  var Id = req.query.userId;
  var userId = mongooes.Types.ObjectId(Id);
  const cartData = await Cart.findOne({ userId: userId });
  if (cartData) {
    let itemIndex = cartData.cartItem.findIndex((cartItem) => {
      return cartItem.productId == productId;
    });
    if (itemIndex > -1) {
      await Cart.updateOne(
        {
          userId: userId,
          "cartItem.productId": productId,
        },
        {
          $inc: { "cartItem.$.qty": 1 },
        }
      );
    } else {
      const cartUpdate = await Cart.updateOne(
        { userId: userId },
        {
          $push: {
            cartItem: {
              productId: productId,
              qty: 1,
            },
          },
        }
      );
    }
  } else {
    const cartOb = new Cart({
      userId: userId,
      cartItem: [{ productId: productId, qty: 1 }],
    });
    await cartOb.save();
  }
  setTimeout(() => {
    res.redirect("Tocart");
  }, 2000);
});

router.get("/add-address", async (req, res) => {
  let userId = req.session.userId;
  console.log(userId);
  let address = await User.aggregate([
    { $match: { _id: userId } },
    { $unwind: "$address" },
    {
      $project: {
        name: "$address.name",
        addressline1: "$address.addressline1",
        addressline2: "$address.addressline2",
        district: "$address.district",
        state: "$address.state",
        country: "$address.country",
        pin: "$address.pin",
        mobile: "$address.mobile",
        _id: "$address._id",
      },
    },
  ]);
  console.log(address);
  res.render("user/partials/add-address", { address: address });
});
router.get("/checkout", (req, res) => {
  res.render("user/partials/checkout");
});

router.post("/add-address", async (req, res) => {
  try {
    let userId = req.session.userId;
    await User.updateOne(
      { _id: userId },
      {
        $push: {
          address: {
            name: req.body.name,
            addressline1: req.body.addressline1,
            addressline2: req.body.addressline2,
            district: req.body.district,
            state: req.body.state,
            country: req.body.country,
            pin: req.body.pin,
            mobile: req.body.mobile,
          },
        },
      }
    );

    res.redirect("/add-address");
  } catch (error) {
    console.log(error);
  }
});

router.post("/resend-otp", async (req, res) => {
  const otp = Math.floor(Math.random() * (9999 - 1000 + 1) + 1000);

  //service nodemailer
  let transporter = await nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "aasooraj47@gmail.com", // generated ethereal user
      pass: "zpibzaaaqjphwcem", // generated ethereal password
    },
  });
  //mail template

  let info = await {
    from: "aasooraj47@gmail.com", // sender address
    to: "asooraj47@gmail.com", // list of receivers
    subject: "otp ✔", // Subject line
    html: `<b>your otp is ${otp}</b>`, // html body
  };
  await transporter.sendMail(info);
  req.session.otp = otp;
  console.log("otp sent-----" + otp);
  res.redirect("/user-login/forgotpassword");
});

router.post("/resendSignup-otp", async (req, res) => {
  const otp = Math.floor(Math.random() * (9999 - 1000 + 1) + 1000);

  //service nodemailer
  let transporter = await nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "aasooraj47@gmail.com", // generated ethereal user
      pass: "zpibzaaaqjphwcem", // generated ethereal password
    },
  });
  //mail template

  let info = await {
    from: "aasooraj47@gmail.com", // sender address
    to: "asooraj47@gmail.com", // list of receivers
    subject: "otp ✔", // Subject line
    html: `<b>your otp is ${otp}</b>`, // html body
  };
  await transporter.sendMail(info);
  req.session.otp = otp;
  console.log("otp sent-----" + otp);
  res.redirect("/user-login/otpverification");
});

router.get("/shop", async (req, res) => {
  const category = await Category.find({});
  res.render("user/partials/shop", {
    usersession: req.session.username,
    userId: req.session.userId,
    category: category,
  });
});

router.get("/profile", userSession.iSLogin, async (req, res) => {
  let user = await User.findOne({ _id: req.session.userId });
  console.log(user);
  res.render("user/partials/profile", {
    usersession: req.session.username,
    userId: req.session.userId,
    user: user,
  });
});

router.post("/changeProfileData", userSession.iSLogin, async (req, res) => {
  try {
    let user = await User.findByIdAndUpdate(req.session.userId, {
      $set: {
        name: req.body.name,
        email: req.body.email,
        mobile: req.body.mobile,
      },
    });
    res.redirect("profile");
  } catch (err) {
    console.log("error in change profile section" + err);
  }
});

router.get("/userProductView", async (req, res) => {
  const categoryId = req.query.id;
  console.log(categoryId);
  const category = await Product.find({ category: categoryId });
  res.render("user/partials/userProductView", {
    usersession: req.session.username,
    userId: req.session.userId,
    category: category,
  });
});

router.get("/cartRemove", async (req, res) => {
  try {
    const userId = req.query.userId;
    const pId = req.query.productId;

    const remove = await Cart.updateOne(
      { userId: userId },
      {
        $pull: { cartItem: { productId: mongooes.Types.ObjectId(pId) } },
      }
    );
    res.redirect("ToCart");

    console.log(remove);
  } catch (err) {
    console.log("cart" + err);
  }
});

router.get("/cartIncrement", async (req, res) => {
  const userId = req.query.userId;
  const productId = req.query.productId;
  const product = await Cart.updateOne(
    { userId: userId, "cartItem.productId": productId },
    {
      $inc: { "cartItem.$.qty": 1 },
    }
  );
  res.redirect("ToCart");
});

router.get("/cartDecrement", async (req, res) => {
  const userId = req.query.userId;
  const productId = req.query.productId;
  const qtyCheck = await Cart.aggregate([

    {
      $match: {
        "cartItem.productId": mongooes.Types.ObjectId(productId),
      },
    },
    {
      $unwind: "$cartItem",
    },
    {
      $match: {
        "cartItem.productId": mongooes.Types.ObjectId(productId),
      },
    },
    {
      $project: {
        "cartItem.qty": 1,
        _id: 0,
      },
    },
  ]);
  let pQty = parseInt(qtyCheck[0].cartItem.qty);
  if (pQty - 1 <= 0) {
    console.log('cartRemoved')
    await Cart.updateOne(
      {
        userId: userId,
      },
      {
        $pull: {
          cartItem: {
            productId: productId,
          },
        },
      }
    );
  }else{
    await Cart.updateOne(
      {
        userId:userId,"cartItem.productId":productId
      },{
        $inc:{"cartItem.$.qty":-1}
      }
    )
  }
  res.redirect('Tocart')
});

module.exports = router;
