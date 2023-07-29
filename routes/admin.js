const express = require("express");
const router = express.Router();
const Banner = require("../model/bannerSchema");
const {hasSubscribers} = require("diagnostics_channel");
const User = require("../model/schema");
const adminController = require("../controllers/admin");
const {Router} = require("express");
const Product = require("../model/productSchema");
const upload = require("../config/multer");
const uploadBanner = require("../config/multerBanner");
const Coupan = require("../model/coupan");
const Category = require("../model/category");
const uploadCategory = require("../config/multercategory");
const Order = require("../model/orderSchema");
const {lookup} = require("dns");

const cloudinary = require("cloudinary").v2;
cloudinary.config({cloud_name: "dvpvoqgia", api_key: "887845154618411", api_secret: "4PN-frHRrPCOsZedU_Y842aHD70", secure: true});

router.get("/", (req, res, next) => {
    res.render("admin/partials/admin-login");
});
let product;
// Admin login
router.post("/login", adminController.login);
router.get("/admin-home", adminController.adminsession,adminController.adminhome);
router.get("/logout", adminController.logout);
router.get("/product-adding", adminController.adminsession, adminController.productAdding);
router.get("/banner-management", adminController.adminsession, adminController.bannermanagement);
router.get("/coupan-management", adminController.adminsession, adminController.coupanmanagement);
router.get("/users/changeAccess", adminController.adminsession, adminController.userchangeaccess);
router.get("/users", adminController.adminsession, adminController.userview);
router.get("/product", adminController.adminsession, adminController.productview);
router.post("/product", adminController.adminsession, adminController.productadd);
router.get("/changelist", adminController.adminsession, adminController.changelist);
router.get("/banner", adminController.adminsession, adminController.bannerview);
let banner;
router.post("/banner", adminController.adminsession, adminController.banneradd);
router.get("/changelistbanner", adminController.adminsession, adminController.changelistbanner);
router.get("/coupan", adminController.adminsession, adminController.coupan);
router.post("/coupan", adminController.adminsession,);
router.get("/coupanvalidity", adminController.adminsession, adminController.coupanvalidity);
router.get("/category", adminController.adminsession, adminController.categoryview);
router.get("/add-category", adminController.adminsession, adminController.addcategoryview);
router.post("/add-category", adminController.adminsession, adminController.addcategory);
router.get("/changelistcategory", adminController.adminsession, adminController.changecategorylist);
router.get("/order-mangements", adminController.adminsession, adminController.oredermangement);
router.get("/generate", adminController.salesdata);
router.get('/orderstatuschange', adminController.adminsession,)


module.exports = router;
