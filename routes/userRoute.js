require('dotenv').config()
const express = require('express');
const user_route = express()

const session = require('express-session');

user_route.use(
    session({
      secret: process.env.sessionSecret,
      resave: false,
      saveUninitialized: true,
    })
  );

const userController = require("../controllers/userController");
const cartController = require("../controllers/cartController");
const addressController = require("../controllers/addressController")
const orderController = require("../controllers/orderController")
const couponController=require("../controllers/couponController")


user_route.set("view engine","ejs");
user_route.set('views', './views/users');

user_route.use(express.json())
user_route.use(express.urlencoded({ extended: true }))

user_route.use(async (req, res, next) => {
  res.locals.cartCount = req.session.cartCount
  next()
})

const auth = require('../middleware/userAuth')

user_route.use((req, res, next) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    // res.setHeader('Content-Type', 'application/json'); // Add this line to set the response header to JSON
    next();
  });
  
  

user_route.get('/home',userController.loadHome);
user_route.get('/',userController.loadHome);

user_route.get('/register',auth.isLogut,userController.loadRegister);
user_route.post('/register',userController.insertUser)

user_route.get('/login',auth.isLogut,userController.loadLogin)
user_route.post('/login',userController.verifyLogin)
user_route.post('/verify-otp', userController.verifyotp);
user_route.get('/otp-verify', userController.acceptotp);

user_route.get('/forgot-password', userController.forgotPasswordStage1)
user_route.post('/emailPass', userController.postforgotPasswordStage1)
user_route.get('/verifyAddOtp', userController.forgotPasswordStage2)
user_route.post('/verify-otp-forgot', userController.postforgotPasswordStage2)
user_route.get('/newPassword', userController.forgotPasswordStage3)
user_route.post('/newPassword',userController.postforgotPasswordStage3)

user_route.get('/product',userController.ProductView)
user_route.get('/watches',userController.listProducts)

user_route.post('/cart', cartController.addToCart)
user_route.get('/cart',auth.isLogin, cartController.viewCart)
user_route.put('/cart/updateQuantity', cartController.updateCart)
user_route.post('/cart/delete', cartController.deleteCart)

user_route.post('/downloadInvoice', orderController.downloadInvoice)

user_route.get('/addReview', userController.getaddReview)
user_route.post('/addReview', userController.postaddReview)
user_route.get('/viewAllReviews', userController.viewReviews)
user_route.get('/delete-review',userController.deleteReview)

user_route.get('/wishlist', userController.viewWishlist)
user_route.get('/addToWishlist', userController.addToWishlist)
user_route.post('/remwish',userController.deleteWishlist)

user_route.get('/user',auth.isLogin, userController.userDash)
user_route.get('/edit-user',auth.isLogin, userController.viewEditUser)
user_route.post('/edit-user',userController.editUser)

user_route.get('/address',auth.isLogin,userController.viewAddress)
user_route.post('/address', addressController.addAddress)
user_route.get('/changePassword',auth.isLogin, userController.loadChangePassword)
user_route.post('/changePassword', userController.changePassword)
user_route.get('/editAddress', userController.editAddress)
user_route.get('/deleteAddress', userController.deleteAddress)
user_route.post('/editAddress', userController.editAndUpdate)


user_route.post('/order', orderController.addOrder)
user_route.get('/orders',auth.isLogin, orderController.viewUserOrder)
user_route.get('/orderDetails', auth.isLogin, orderController.orderDetails)
user_route.post('/cancel-order', orderController.cancelOrder)
user_route.post('/return',orderController.returnOrder)

user_route.get('/checkout', auth.isLogin, userController.checkout)
user_route.post('/verify-payment', orderController.payment)
user_route.get('/orderSuccess', orderController.paymentSucess)
user_route.get('/addressCheckout', addressController.getaddressCheck)
user_route.post('/addressCheck',addressController.postaddressCheck)

user_route.post('/coupons/validate', couponController.verifyCoupon)
user_route.get('/wallet-history',auth.isLogin,userController.wallet)

user_route.get('/aboutUs', userController.about)
user_route.get('/contact-us', userController.contact)
user_route.post('/contact-us',userController.postContact)

user_route.post('/logout',userController.logOut)


module.exports = user_route;
