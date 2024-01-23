const bcrypt = require("bcrypt");
const User = require("../model/schema");
const nodemailer = require("nodemailer");
const Product=require('../model/productSchema')
const Category=require('../model/category')
const Address=require('../model/addressSchema')
const Wish=require('../model/wishSchema')
const mongooes = require("mongoose");
const Cart= require('../model/cart')
let user;
const userController = {

  //home
  home: async (req, res, next) => {
    let user = await User.find({ _id: req.session.userId });
    let productData = await Product.find({ list: true });
    res.render("user/partials/index", {
      usersession: req.session.username,
      productData: productData,
      userId: req.session.userId,
      user: user,
    });
  },


//logout
  logout: async(req, res) => {
    req.session.destroy();
    res.redirect("/");
  },

  //checkout
  checkout: async (req, res) => {
    const total = req.query.total;
    const userEmail = await User.findById({ _id: req.session.userId });
    const email = userEmail.email;
    const address = await Address.find({ user_id: email });
    res.render("user/partials/checkout", { total: total, address: address });
  },


  //registerUser
  registeruser: async (req, res) => {
    const hashpassword = await bcrypt.hash(req.body.password, 10);
    user = new User({
      name: req.body.name,
      email: req.body.email,
      mobile: req.body.mobile,
      password: hashpassword,
    });
    let usercheck = await User.findOne({ email: user.email });
    if (usercheck) {
      res.render("user/partials/user-login", { error: "already existing" });
    } else {
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
        to: req.body.email, // list of receivers
        subject: "otp ✔", // Subject line
        html: `<b>your otp is ${otp}</b>`, // html body
      };
      await transporter.sendMail(info);
      req.session.otp = otp;
      console.log("otp sent-----" + otp);
      res.redirect("/user-login/otpverification");
    }
  },

  

    //otpverification  
  otpverfication: async (req, res) => {
    const inputotp = req.body.otp;
    const otp = req.session.otp;
    if (inputotp == otp) {
      await user.save((err, doc) => {
        if (err) return err;
        else return doc;
      });

      req.session.otp = false;
      res.redirect("/user-login/");
    } else {
      res.render("user/partials/otpverification", { otp: "otp is invalid" });
    }
  },


  //forgotpassword
  forgotpassword: async (req, res) => {
    const inputemail = req.body.email;
    const mailchecker = await User.find({ email: inputemail });
    if (mailchecker) {
      req.session.resetpasswordauth = inputemail;
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
        to: inputemail, // list of receivers
        subject: "otp ✔", // Subject line
        html: `<b>your otp is ${otp}</b>`, // html body
      };
      await transporter.sendMail(info);
      req.session.otp = otp;
      console.log("otp sent-----" + otp);
      res.redirect("/user-login/forgotpassword/forgotpassword-otp");
    } else {
      res.render("/user-login/forgotpassword", { error: "not exist" });
    }
  },


  //forgototp
  forgototp: async (req, res) => {
    if (req.session.resetpasswordauth && req.session.otp) {
      const forgototp = req.body.otp;
      if (forgototp == req.session.otp) {
        req.session.otp = false;
        req.session.passwordchange = true;
        console.log("sessioncreated for used password change");
        res.redirect("/user-login/changepassword");
      } else {
        res.render("user/partials/forgotpassword-otp", {
          error: "otp is wrong",
        });
      }
    } else {
      res.redirect("/user-login");
    }
  },

  //passwordchange
  passwordchange: async (req, res) => {
    if (req.session.resetpasswordauth && req.session.passwordchange) {
      const customermail = req.session.resetpasswordauth;
      const npassword = await bcrypt.hash(req.body.password, 10);
      await User.updateOne(
        {
          email: customermail,
        },
        { $set: { password: npassword } }
      );
      req.session.resetpasswordauth = false;
      req.session.passwordchange = false;
      console.log("User password updated successfully");
      res.redirect("/user-login");
    } else {
      res.redirect("/user-login");
    }
  },



  //login
  login: async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    const useremail = await User.findOne({ email: email });
    if (useremail) {
      if (useremail.verified) {
        const pssword = await bcrypt.compare(password, useremail.password);
        if (pssword) {
          req.session.username = useremail.name;
          req.session.userId = useremail._id;
          console.log(req.session.userId);
          res.redirect("/");
        } else {
          res.render("user/partials/user-login", { error1: "password error" });
        }
      } else {
        res.render("user/partials/user-login", { error1: "Banned user" });
      }
    } else {
      res.render("user/partials/user-login", { error1: "email not found" });
    }
  },


  //usercategory
  usercategory: async (req, res) => {
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
  },


  //tocart
  ToCart: async (req, res) => {
    const userId = req.session.userId;

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
   
    res.render("user/partials/cart", {
      cartList: cartList,
      userId: req.session.userId,
    });
    console.log(cartList);
  },


  //addtocart
  addToCart: async (req, res) => {
    let productId = req.query.productId;
    const Id = req.query.userId;
    const userId = mongooes.Types.ObjectId(Id);
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
  },


  //resendotp
  resendOtp: async (req, res) => {
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
    await transporter.sendMail(info)
    req.session.otp = otp;
    console.log("otp sent-----" + otp);
    res.redirect("/user-login/forgotpassword")
  },



  //resendsignupotp
  resendSignupOtp: async (req, res) => {
    const otp = Math.floor(Math.random() * (9999 - 1000 + 1) + 1000);

    //service nodemailer
    let transporter = await nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "aasooraj47@gmail.com", // generated ethereal user
        pass: "zpibzaaaqjphwcem", // generated ethereal password
      },
    })
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
  },



  //shop
  shop: async (req, res) => {
    const category = await Category.find({});
    res.render("user/partials/shop", {
      usersession: req.session.username,
      userId: req.session.userId,
      category: category,
    })
  },



  //changepassword
  changepassword: (req, res) => {
    if (req.session.resetpasswordauth && req.session.passwordchange) {
      res.render("user/partials/changepassword");
    } else {
      res.redirect("/user-login");
    }
  },


  //forgotpasswordotp
  forgotpasswordOtp: (req, res) => {
    if (req.session.resetpasswordauth && req.session.otp) {
      res.render("user/partials/forgotpassword-otp");
    } else {
      res.redirect("/user-login");
    }
  },


  //changeprofileotp

  changeProfile: async (req, res) => {
    const userEmail = await User.findById({ _id: req.session.userId });
    res.render("user/partials/changeProfile", { user: userEmail });
  },


  //profile
  profile: async (req, res) => {
    const user = await User.findOne({ _id: req.session.userId });
    const Aemail = user.email;
    const address = await Address.find({ user_id: Aemail });
    res.render("user/partials/profile", {
      usersession: req.session.username,
      userId: req.session.userId,
      user: user,
      address: address,
    });
  },


  //userproductionview
  userProductView: async (req, res) => {
    const categoryId = req.query.id;
    const userId=req.session.userId
    const wish = await Wish.findOne({ userId: userId }).populate("productId");
    const category = await Product.find({ category: categoryId });
    res.render("user/partials/userProductView", {
      usersession: req.session.username,
      userId: req.session.userId,
      category: category,wish:wish
    });
  },


  //catremove
  catRemove: async (req, res) => {
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
  },

  //cartincrement
  cartIncrement: async (req, res) => {
    const userId = req.query.userId;
    const productId = req.query.productId;
    const product = await Cart.updateOne(
      { userId: userId, "cartItem.productId": productId },
      {
        $inc: { "cartItem.$.qty": 1 },
      }
    );
    res.redirect("ToCart");
  },


  //cartdecrement
  cartDecrement: async (req, res) => {
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
      console.log("cartRemoved");
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
    } else {
      await Cart.updateOne(
        {
          userId: userId,
          "cartItem.productId": productId,
        },
        {
          $inc: { "cartItem.$.qty": -1 },
        }
      );
    }
    res.redirect("Tocart");
  },


  //addaddress
  addAddress: async (req, res) => {
    const userEmail = await User.findById({ _id: req.session.userId });
    const email = userEmail.email;
    const addressDetails = await new Address({
      user_id: email,
      address: req.body.address,
      city: req.body.city,
      district: req.body.district,
      phone: req.body.phone,
      pincode: req.body.pincode,
    });
    await addressDetails.save().then((results) => {
      if (results) {
        res.redirect("profile");
      } else {
        res.json({ status: false });
      }
    });
  },


  //chanageprofile
  changeProfileData: async (req, res) => {
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
  },


  //wishlist
  addWishlist:async (req, res) => {
    const productId = req.query.productId;
    const userId = req.query.userId;
    const user = await Wish.findOne({ userId: userId });
    const productExist = await Wish.findOne(
      { userId: userId },
      { productId: productId }
    );
    if (user) {
      await Wish.updateOne(
        { userId: userId },
        {
          $push: {
            productId: [productId],
          },
        }
      );
    } else {
      const wishobj = new Wish({
        userId: userId,
        productId: [productId],
      });
      await wishobj.save();
    }
  
    res.redirect("wishlist");
  },


//deleteWish
deleteWish: async (req, res) => {
  const userId = req.query.userId;
  const productId = req.query.productId;
  const remove = await Wish.updateOne(
    { userId: userId },
    {
      $pull: { productId: mongooes.Types.ObjectId(productId) },
    }
  );
  res.redirect("shop");
},

checkout:async (req, res) => {
  const total = req.body.total;
  console.log(total);
  const userEmail = await User.findById({ _id: req.session.userId });
  const email = userEmail.email;
  const address = await Address.find({ user_id: email });
  res.render("user/partials/checkout", { total: total, address: address });
},
wishlist:async (req, res) => {
  const userId = req.session.userId;
  const wish = await Wish.findOne({ userId: userId }).populate("productId");
  res.render("user/partials/wishlist", {
    usersession: req.session.username,
    userId: req.session.userId,
    wish: wish,
  });
},
deletewishlist:async (req, res) => {
  const userId = req.query.userId;
  const productId = req.query.productId;
  const remove = await Wish.updateOne(
    { userId: userId },
    {
      $pull: { productId: mongooes.Types.ObjectId(productId) },
    }
  );
  res.redirect("shop");
},
payment:async (req, res) => {
  const gtotal=req.body.grandtotal
  const userId = req.session.userId;
  const address = req.body.address;
  console.log(gtotal);
  const cart = await Cart.aggregate([
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
        name: "$catData.name",
        price: "$catData.price",
        qty: "$qtyItem",
      },
    },
  ]);
  console.log(userId, address, cart);
  const price1 = parseInt(req.body.total);
  const price = price1;
  const create_payment_json = {
    intent: "sale",
    payer: {
      payment_method: "paypal",
    },
    redirect_urls: {
      return_url: "http://localhost:5000/order",
      cancel_url: "http://localhost:5000",
    },
    transactions: [
      {
        item_list: {
          items: [
            {
              name: "Red Sox Hat",
              sku: "001",
              price: price,
              currency: "USD",
              quantity: 1,
            },
          ],
        },
        amount: {
          currency: "USD",
          total: price,
        },
        description: "Hat for the best team ever",
      },
    ],
  };

  paypal.payment.create(create_payment_json, async function (error, payment) {
    if (error) {
      throw error;
    } else {
      for (let i = 0; i < payment.links.length; i++) {
        if (payment.links[i].rel === "approval_url") {
          res.redirect(payment.links[i].href);
          const order=await Order.insertMany([{
           userId:userId,
          product:cart,
          addresses:address,
          total:gtotal
          }])
          

        }
      }
    }
  });
},
paymentsuccessful: (req, res) => {
  const payerId = req.query.PayerID;
  const paymentId = req.query.paymentId;

  const execute_payment_json = {
    payer_id: payerId,
    transactions: [
      {
        amount: {
          currency: "USD",
          total: price,
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
},

paymentmore:async (req, res) => {
  try {
    const product = await Product.find().sort({ price: -1 });
    res.render("user/partials/userProductView", {
      usersession: req.session.username,
      userId: req.session.userId,
      category: product,
    });
  } catch (error) {
    console.log("sort error" + error);
  }
},
paymentless:async (req, res) => {
  try {
    const product = await Product.find().sort({ price: 1 });
    res.render("user/partials/userProductView", {
      usersession: req.session.username,
      userId: req.session.userId,
      category: product,
    });
  } catch (error) {
    console.log("sort error" + error);
  }
},

orderget:async (req, res) => {

  const order1=  await Order.aggregate([{
    $lookup: {
      from: "addresses",
      localField: "addresses",
      foreignField: "_id",
      as: "addressData",
    },  
},
{
  $lookup: {
    from: "users",
    localField: "userId",
    foreignField: "name",
    as: "userData",
  }, 
},
{
  $unwind:"$addressData"
},

])


  res.render("user/partials/order", {
    usersession: req.session.username,
    userId: req.session.userId,order1:order1
  });
},
coupancheck:async (req, res) => {
  const cartPrice = req.body.cartPrice;
  const coupan = await Coupan.findOne({ name: req.body.couponCode });
  console.log(req.body.couponCode);
  if (coupan) {
    const discountPrice = (cartPrice * coupan.offer) / 100;
    const finalPrice = cartPrice - discountPrice;
    res.json({
      data: {
        discountPrice: discountPrice,
        finalPrice: finalPrice,
      },
    });
  }
},
getaddaddress:async (req, res) => {
  res.render("user/partials/add-address", {userId: req.session.userId});
},


};
module.exports = userController;
