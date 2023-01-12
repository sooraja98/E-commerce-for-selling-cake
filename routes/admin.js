const express = require("express");
const router = express.Router();
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
const Order = require("../model/orderSchema");
const { lookup } = require("dns");


const cloudinary = require("cloudinary").v2;
cloudinary.config({
  cloud_name: "dvpvoqgia",
  api_key: "887845154618411",
  api_secret: "4PN-frHRrPCOsZedU_Y842aHD70",
  secure: true,
});

router.get("/", (req, res, next) => {
  res.render("admin/partials/admin-login");
});
let product;

//Admin login
router.post("/login", (req, res) => {
  const aemil = "a@gmail.com";
  const apassword = "1";
  const email = req.body.email;
  const password = req.body.password;
  if (aemil == email && apassword == password) {
    req.session.admin = true;
    res.redirect("admin-home");
  } else {
    res.redirect("/");
  }
});
router.get("/admin-home", adminController.adminsession, (req, res) => {
  res.render("admin/partials/admin-home");
});

router.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/admin");
});

router.get(
  "/product-adding",
  adminController.adminsession,
  async (req, res) => {
    let details = await Product.aggregate([
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
    res.render("admin/partials/product-adding", { products: details });
  }
);

router.get(
  "/banner-management",
  adminController.adminsession,
  async (req, res) => {
    const bannerImage = await Banner.find({});
    res.render("admin/partials/banner-management", {
      bannerImage: bannerImage,
    });
  }
);
router.get(
  "/coupan-management",
  adminController.adminsession,
  async (req, res) => {
    const coupan = await Coupan.find({});
    res.render("admin/partials/coupan-management", { coupan: coupan });
  }
);

router.get(
  "/users/changeAccess",
  adminController.adminsession,
  async (req, res) => {
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
  }
);
router.get("/users", adminController.adminsession, adminController.userview);

router.get("/product", adminController.adminsession, async (req, res) => {
  let category = await Category.find({ list: true });
  res.render("admin/partials/product", { category: category });
});

router.post("/product", adminController.adminsession, async (req, res) => {
  const file = req.files.image;
  let imagePath;
  await cloudinary.uploader.upload(
    file.tempFilePath,
    { folder: "Products" },
    (error, result) => {
      imagePath = result.secure_url;
      public_id = result.public_id;
    }
  );

  try {
    product = new Product({
      name: req.body.name,
      category: req.body.category,
      description: req.body.description,
      price: req.body.price,
      image: imagePath,
    });
    product.save();
    res.redirect("product-adding");
  } catch (err) {
    console.log(err);
  }
});

router.get("/changelist", adminController.adminsession, async (req, res) => {
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

router.get("/banner", adminController.adminsession, (req, res) => {
  res.render("admin/partials/banner");
});
let banner;
router.post("/banner", adminController.adminsession, async (req, res) => {
  const file = req.files.image;
  let imagePath;
  await cloudinary.uploader.upload(
    file.tempFilePath,
    { folder: "Banner" },
    (error, result) => {
      imagePath = result.secure_url;
      public_id = result.public_id;
    }
  );

  banner = new Banner({
    name: req.body.name,
    image: imagePath,
  });
  banner.save();
  res.redirect("banner-management");
});

router.get(
  "/changelistbanner",
  adminController.adminsession,
  async (req, res) => {
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
  }
);

router.get("/coupan", adminController.adminsession, (req, res) => {
  res.render("admin/partials/coupan");
});

router.post("/coupan", adminController.adminsession, (req, res) => {
  let coupan = new Coupan({
    name: req.body.name,
    offer: req.body.offer,
    startdate: req.body.startdate,
    enddate: req.body.enddate,
  });
  coupan.save();
  res.redirect("coupan-management");
});

router.get(
  "/coupanvalidity",
  adminController.adminsession,
  async (req, res) => {
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
    await Coupan.findByIdAndUpdate(coupanid, {
      $set: { status: coupanStatus },
    });
    res.redirect("coupan-management");
  }
);
router.get("/category", adminController.adminsession, async (req, res) => {
  const categoryData = await Category.find({});
  res.render("admin/partials/category", { categoryData: categoryData });
});
router.get("/add-category", adminController.adminsession, (req, res) => {
  res.render("admin/partials/add-category");
});
router.post("/add-category", adminController.adminsession, async (req, res) => {
  const file = req.files.image;
  let imagePath;
  await cloudinary.uploader.upload(
    file.tempFilePath,
    { folder: "Category" },
    (error, result) => {
      imagePath = result.secure_url;
    }
  );
  const categoryDetails = new Category({
    name: req.body.name,
    image: imagePath,
  });
  categoryDetails.save();
  res.redirect("category");
});

router.get(
  "/changelistcategory",
  adminController.adminsession,
  async (req, res) => {
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
  }
);

router.get("/order-mangements", adminController.adminsession, async(req, res) => {
  const order=  await Order.aggregate([{
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
    foreignField: "_id",
    as: "userData",
  }, 
},
{
  $unwind:"$addressData"
},

])

  console.log(order);
  res.render("admin/partials/order-mangement",{order});
});

module.exports = router;
