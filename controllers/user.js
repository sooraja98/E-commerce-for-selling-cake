const bcrypt = require("bcrypt");
const User = require("../model/schema");
const nodemailer = require("nodemailer");
let user;
module.exports = {
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
};
