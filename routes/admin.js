var express = require("express");
var router = express.Router();
const Banner = require("../model/bannerSchema");
const { hasSubscribers } = require("diagnostics_channel");
const User = require("../model/schema");
const adminController = require("../controllers/admin");
const { Router } = require("express");
const Product = require("../model/productSchema");
const upload = require("../config/multer");
const uploadBanner = require("../config/multerBanner");
const Coupan = require("../model/coupan");
const Category = require("../model/category");
const uploadCategory = require("../config/multercategory");

router.get("/", (req, res, next) => {
  res.render("admin/partials/admin-login");
});
let product;

//Admin login
router.post("/login", adminController.adminsession, (req, res) => {
  const aemil = "a@gmail.com";
  const apassword = "1";
  const email = req.body.email;
  const password = req.body.password;

  if (aemil == email && apassword == password) {
    res.redirect("/admin/admin-home");
  } else {
    res.redirect("/");
  }
});
router.get("/admin-home", adminController.adminsession, (req, res) => {
  res.render("admin/partials/admin-home");
});

router.get("/logout", (req, res) => {
  res.redirect("/admin");
  req.session.destroy();
});

router.get("/product-adding", async (req, res) => {
  let details = await Product.aggregate([
    {
    $lookup:{
      from:"categories",
      localField:"category",
      foreignField:"_id",
      as:"catdata"
    }},
    {
    $project:{
      name:"$name",
      category:"$catdata.name",
      description:"$description",
      price:"$price",
      list:"$list",
      image:"$image"
    }
  }
])
console.log(details)
  res.render("admin/partials/product-adding",{products:details})
  
});

router.get("/banner-management", async (req, res) => {
  const bannerImage = await Banner.find({});
  res.render("admin/partials/banner-management", { bannerImage: bannerImage });
});
router.get("/coupan-management", async (req, res) => {
  const coupan = await Coupan.find({});
  res.render("admin/partials/coupan-management", { coupan: coupan });
});

router.get("/users/changeAccess", async (req, res) => {
  let customerID = req.query.id;
  let currentCustomer = await User.findById(customerID);
  let currentAccess = currentCustomer.verified;
  if (currentAccess == true) {
    currentAccess = false;
  } else if (currentAccess == false) {
    currentAccess = true;
  }
  currentAccess = Boolean(currentAccess);
  await User.findByIdAndUpdate(customerID, {
    $set: { verified: currentAccess },
  });
  res.redirect("/admin/users");
});
router.get("/users", adminController.userview);

router.get("/product", async (req, res) => {
  let category = await Category.find({list:true});
  res.render("admin/partials/product", { category: category });
});

router.post("/product", upload.single("image"), (req, res) => {
  try {
    product = new Product({
      name: req.body.name,
      category: req.body.category,
      description: req.body.description,
      price: req.body.price,
      image: req.file.filename,
    });
    product.save();
    res.redirect("product-adding");
  } catch (err) {
    console.log(err);
  }
});

router.get("/changelist", async (req, res) => {
  const id = req.query.id;
  const product = await Product.findById(id);
  let currentlist = product.list;
  if (currentlist == true) {
    currentlist = false;
    Boolean(currentlist);
  } else if (currentlist == false) {
    currentlist = true;
    Boolean(currentlist);
  }
  await Product.findByIdAndUpdate(id, { $set: { list: currentlist } });
  res.redirect("/admin/product-adding");
});

router.get("/banner", (req, res) => {
  res.render("admin/partials/banner");
});
let banner;
router.post("/banner", uploadBanner.single("image"), (req, res) => {
  banner = new Banner({
    name: req.body.name,
    image: req.file.filename,
  });
  banner.save();
  res.redirect("banner-management");
});

router.get("/changelistbanner", async (req, res) => {
  const bannerid = req.query.id;
  const bannerdetails = await Banner.findById(bannerid);
  let bannerlist = bannerdetails.list;
  if (bannerlist == true) {
    bannerlist = false;
    Boolean(bannerlist);
  } else if (bannerlist == false) {
    bannerlist = true;
    Boolean(bannerlist);
  }
  await Banner.findByIdAndUpdate(bannerid, { $set: { list: bannerlist } });
  res.redirect("/admin/banner-management");
});

router.get("/coupan", (req, res) => {
  res.render("admin/partials/coupan");
});

router.post("/coupan", (req, res) => {
  let coupan = new Coupan({
    name: req.body.name,
    offer: req.body.offer,
    startdate: req.body.startdate,
    enddate: req.body.enddate,
  });
  coupan.save();
  res.redirect("coupan-management");
});

router.get("/coupanvalidity", async (req, res) => {
  const coupanid = req.query.id;
  const coupandetails = await Coupan.findById(coupanid);
  let coupanStatus = coupandetails.status;
  if (coupanStatus == true) {
    coupanStatus = false;
    Boolean(coupanStatus);
  } else if (coupanStatus == false) {
    coupanStatus = true;
    Boolean(coupanStatus);
  }
  await Coupan.findByIdAndUpdate(coupanid, { $set: { status: coupanStatus } });
  res.redirect("coupan-management");
});
router.get("/category", async (req, res) => {
  const categoryData = await Category.find({});
  res.render("admin/partials/category", { categoryData: categoryData });
});
router.get("/add-category", (req, res) => {
  res.render("admin/partials/add-category");
});
router.post("/add-category", uploadCategory.single("image"), (req, res) => {
  const categoryDetails = new Category({
    name: req.body.name,
    image: req.file.filename,
  });
  categoryDetails.save();
  res.redirect("category");
});

router.get("/changelistcategory", async (req, res) => {
  const categoryid = req.query.id;
  const categoydetails = await Category.findById(categoryid);
  let categoryList = categoydetails.list;
  if (categoryList == true) {
    categoryList = false;
    Boolean(categoryList);
  } else if (categoryList == false) {
    categoryList = true;
    Boolean(categoryList);
  }
  await Category.findByIdAndUpdate(categoryid, {
    $set: { list: categoryList },
  });
  res.redirect("category");
}); 





router.get("/order-mangements",(req,res)=>{
  res.render("admin/partials/order-mangement")
})






module.exports = router;
