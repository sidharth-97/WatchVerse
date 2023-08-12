const express = require("express");
const admin_route = express();

admin_route.use(express.json());
admin_route.use(express.urlencoded({ extended: true }));

const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../public/productImages"));
  },
  filename: function (req, file, cb) {
    const name = Date.now() + "-" + file.originalname;
    cb(null, name);
  },
});


const session = require('express-session');

admin_route.use(
    session({
      secret: process.env.sessionSecret,
      resave: false,
      saveUninitialized: true,
    })
  );
  const auth = require('../middleware/adminAuth')


const upload = multer({ storage: storage });

// admin_route.use(express.static('public'))

admin_route.set("view engine", "ejs");
admin_route.set("views", "./views/admin");

const adminController = require("../controllers/adminController");
const productController = require("../controllers/productContoller");
const orderController = require("../controllers/orderController")
const couponController = require("../controllers/couponController")
const bannerController = require("../controllers/bannerController")
const offerController=require("../controllers/offerController")


admin_route.get("/",auth.isLogout,adminController.loadLogin);
admin_route.post("/login", adminController.verifyLogin);

admin_route.get("/dashboard",auth.isLogin,adminController.loadDashboard);

admin_route.get("/user",auth.isLogin,adminController.viewUsers);
admin_route.get("/block-user",auth.isLogin, adminController.blockUser);

admin_route.get("/category",auth.isLogin, adminController.viewCategory);
admin_route.post("/category/add-category", upload.single('categoryImage'),adminController.addCategory);
admin_route.get("/category/unlist",auth.isLogin, adminController.unlist);
admin_route.post("/category/edit-category",upload.single('categoryImage'), adminController.editCategory);
admin_route.post("/category/addCatOffer", adminController.addOfferCategory)
admin_route.get('/category/cancelOffer',adminController.cancelOffer)

admin_route.get('/category/edit', adminController.editcat)


admin_route.get("/products",auth.isLogin, productController.viewProduct);

admin_route.get("/products/add-products",auth.isLogin, productController.viewProductPage);
admin_route.post("/products/add-products", upload.array("image", 3),productController.addProduct);
admin_route.get("/products/edit-products/:id",productController.viewEditProduct);
admin_route.post("/products/edit-products/:id",upload.array("image", 3),productController.editProduct);
admin_route.get("/productImageDelete/:id", productController.imageDelete);
admin_route.get('/products/status', productController.prodStatus)
admin_route.post('/products/addProductOffer', productController.prodOffer)
admin_route.get('/products/cancelOffer',productController.cancelProdOffer)

admin_route.get("/orders",auth.isLogin, orderController.adminOrder)
admin_route.post('/order/updateOrderStatus', orderController.orderStatus)
admin_route.post('/returnApprove',orderController.approveReturn)

admin_route.get('/coupons',auth.isLogin, couponController.viewCoupons)
admin_route.get('/coupons/add-coupons', auth.isLogin,couponController.addCouponsView)
admin_route.post('/coupons/add-coupons', couponController.addCoupons)
admin_route.get('/coupons/edit-coupons', auth.isLogin,couponController.editCoupons)
admin_route.post('/coupons/edit-coupons', couponController.postEditCoupons)

admin_route.post('/offers/add-offers', offerController.addOffer)
admin_route.get('/offers/add-offers',auth.isLogin,offerController.getAddOffer)

admin_route.get('/banners',auth.isLogin, bannerController.getaddBanners)
admin_route.post('/banner', upload.single('bannerImage'),bannerController.postaddBanners)

admin_route.post('/logout',adminController.logout)

module.exports = admin_route;
