const bcrypt = require("bcrypt");
const User = require("../model/schema");
const nodemailer = require("nodemailer");
let user;
module.exports = {

  //home
  home: async (req, res, next) => {
    let user = await User.find({ _id: req.session.userId });
    let productData = await Product.find({ list: true });
    console.log("HELO " + req.session.userId);
    res.render("user/partials/index", {
      usersession: req.session.username,
      productData: productData,
      userId: req.session.userId,
      user: user,
    });
  },


//logout
  logout: (req, res) => {
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
    console.log(cartList);
  },


  //addtocart
  addToCart: async (req, res) => {
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
    console.log(categoryId);
    const category = await Product.find({ category: categoryId });
    res.render("user/partials/userProductView", {
      usersession: req.session.username,
      userId: req.session.userId,
      category: category,
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
      state: req.body.state,
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
};
