const User = require("../model/schema");
const coupan = require('../model/coupan')
const session = require('express-session')

module.exports = {
    userview: async (req, res) => {
        const userList = await User.find({});
        console.log(userList)
        res.render("admin/partials/user", {customer: userList})
    },

    adminsession: (req, res, next) => {
        try {
            if (req.session.admin) {} else {
                res.redirect("admin")
            }
            next()
        } catch (err) {
            console.log("error in is admin session" + err);
        }
    },
    productAdding: async (req, res) => {
        let details = await Product.aggregate([
            {
                $lookup: {
                    from: "categories",
                    localField: "category",
                    foreignField: "_id",
                    as: "catdata"
                }
            }, {
                $project: {
                    name: "$name",
                    category: "$catdata.name",
                    description: "$description",
                    price: "$price",
                    list: "$list",
                    image: "$image"
                }
            },
        ]);
        res.render("admin/partials/product-adding", {products: details});
    },
    logout: (req, res) => {
        req.session.destroy();
        res.redirect("/admin");
    },
    login: (req, res) => {
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
    },
    bannermanagement: async (req, res) => {
        const bannerImage = await Banner.find({});
        res.render("admin/partials/banner-management", {bannerImage: bannerImage});
    },
    coupanmanagement: async (req, res) => {
        const coupan = await Coupan.find({});
        res.render("admin/partials/coupan-management", {coupan: coupan});
    },
    userchangeaccess: async (req, res) => {
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
            $set: {
                verified: currentAccess
            }
        });
        res.redirect("/admin/users");
    },
    productview: async (req, res) => {
        let category = await Category.find({list: true});
        res.render("admin/partials/product", {category: category});
    },
    productadd: async (req, res) => {
        const file = req.files.image;
        let imagePath;
        await cloudinary.uploader.upload(file.tempFilePath, {
            folder: "Products"
        }, (error, result) => {
            imagePath = result.secure_url;
            public_id = result.public_id;
        });

        try {
            product = new Product({
                name: req.body.name,
                category: req.body.category,
                description: req.body.description,
                price: req.body.price,
                image: imagePath
            });
            product.save();
            res.redirect("product-adding");
        } catch (err) {
            console.log(err);
        }
    },
    changelist: async (req, res) => {
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
        await Product.findByIdAndUpdate(id, {
            $set: {
                list: currentlist
            }
        });
        res.redirect("/admin/product-adding");
    },
    bannerview: (req, res) => {
        res.render("admin/partials/banner");
    },
    banneradd: async (req, res) => {
        const file = req.files.image;
        let imagePath;
        await cloudinary.uploader.upload(file.tempFilePath, {
            folder: "Banner"
        }, (error, result) => {
            imagePath = result.secure_url;
            public_id = result.public_id;
        });

        banner = new Banner({name: req.body.name, image: imagePath});
        banner.save();
        res.redirect("banner-management");
    },
    changelistbanner: async (req, res) => {
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
        await Banner.findByIdAndUpdate(bannerid, {
            $set: {
                list: bannerlist
            }
        });
        res.redirect("/admin/banner-management");
    },
    coupan: (req, res) => {
        res.render("admin/partials/coupan");
    },
    coupanadd: (req, res) => {
        let coupan = new Coupan({name: req.body.name, offer: req.body.offer, startdate: req.body.startdate, enddate: req.body.enddate});
        coupan.save();
        res.redirect("coupan-management");
    },
    coupanvalidity: async (req, res) => {
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
            $set: {
                status: coupanStatus
            }
        });
        res.redirect("coupan-management");
    },
    categoryview: async (req, res) => {
        const categoryData = await Category.find({});
        res.render("admin/partials/category", {categoryData: categoryData});
    },
    addcategory: async (req, res) => {
        const file = req.files.image;
        let imagePath;
        await cloudinary.uploader.upload(file.tempFilePath, {
            folder: "Category"
        }, (error, result) => {
            imagePath = result.secure_url;
        });
        const categoryDetails = new Category({name: req.body.name, image: imagePath});
        categoryDetails.save();
        res.redirect("category");
    },
    changecategorylist: async (req, res) => {
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
            $set: {
                list: categoryList
            }
        });
        res.redirect("category");
    },
    oredermangement: async (req, res) => {
        const order = await Order.aggregate([
            {
                $lookup: {
                    from: "addresses",
                    localField: "addresses",
                    foreignField: "_id",
                    as: "addressData"
                }
            }, {
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "userData"
                }
            }, {
                $unwind: "$addressData"
            },
        ]);

        res.render("admin/partials/order-mangement", {order: order});
    },
    salesdata: async (req, res) => {
        let orderData = await Order.aggregate([
            {
                $match: {
                    status: "Placed"
                }
            }, {
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "orderUserData"
                }
            },
        ]);

        let salesData = []; // this array is created because the sales report template cannot read the data like this.user[0].fName??????????????????
        for (let i = 0; i < orderData.length; i++) {
            let order = {
                address: orderData[i].address.houseName,
                fName: orderData[i].user[0].fName,
                netAmount: orderData[i].netAmount,
                status: orderData[i].status,
                orderDate: orderData[i].orderDate
            };
            salesData.push(order);
        }

        let totalAmount = 0;
        for (let i = 0; i < orderData.length; i++) {
            totalAmount = totalAmount + orderData[i].netAmount;
        }

        const html = fs.readFileSync(path.join(__dirname, "../views/adminFiles/salesReport/reportTemplate.html"), "utf-8");
        const filename = Math.random() + "_doc" + ".pdf";
        const filepath = "/public/salesReports/" + filename;

        const document = {
            html: html,
            data: {
                salesData,
                totalAmount
            },
            path: "./public/salesReports/" + filename
        };
        pdf.create(document).then((resolve) => {
            console.log(resolve);
            res.redirect(`/admin/orders?genarated=${true}&path=${filepath}`);
        }).catch((err) => {
            console.log(err);
        });
    },
    orderstatuschange: async (req, res) => {
        const orderId = req.query.id;
        const orderdetails = await Order.findById(orderId);
        let orderList = orderdetails.status;
        if (orderList == "Placed") {
            orderList = "not placed";
        } else if (orderList == "not placed") {
            orderList = "Placed";
        }
        await Category.findByIdAndUpdate(orderId, {
            $set: {
                status: orderList
            }
        });
        res.redirect("order-mangements");

    },
    addcategoryview: (req, res) => {
        res.render("admin/partials/add-category");
    },
    adminhome: (req, res) => {
        res.render("admin/partials/admin-home");
    }
}
