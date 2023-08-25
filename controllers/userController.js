const modelU = require("../models/userModel");
const User = modelU.userS;
const modelP = require("../models/productModel");
const Product = modelP.product;
const modelC = require("../models/cartModel");
const Cart = modelC.cart;
const modelA = require("../models/addressModel");
const Address = modelA.address;
const modelO = require("../models/orderModel");
const Order = modelO;
const modelCa=require('../models/categoryModel');
const Category = modelCa.category
const Banners = require('../models/bannerModel');
const Banner=Banners.Banner
const modelCo = require("../models/couponModel")
const Coupon = modelCo
const Offer = require("../models/offerModel");

const mongoose = require("mongoose");

const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const { OrderedBulkOperation } = require("mongodb");

const securePassword = async (password) => {
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    return passwordHash;
  } catch (error) {
    console.log(error.message);
  }
};

const loadRegister = async (req, res, next) => {
  try {
    res.render("register");
  } catch (error) {
    console.log(error.message);
  }
};

const loadHome = async (req, res, next) => {
  try {
    let banner = await Banner.find({})
    const category=await Category.find({isListed:true})
    const product = await Product.find({ isListed: true }).sort({ _id: -1 }).limit(4)
    
    
    if (req.session.user) {
      const recc = await Order.find({ user: req.session.user._id }).populate('products.productId').sort({ _id: -1 }).limit(1)
      if (recc.length > 0) {
        const category1 = recc[0].products[0].productId.category;
        var reccprod=await Product.find({category:category1})
      } else {
        var reccprod=null
      }
    
      res.render("home", { user: req.session.user,banner:banner,category:category,product,reccprod});
    } else {
      res.render("home", { user: null, banner: banner,category:category,product,reccprod:null});
    }
  } catch (error) {
    next(error)
  }

};

const loadLogin = async (req, res, next) => {
  try {
    res.render("login");
  } catch (error) {
    next(error)
  }
};

const acceptotp = async (req, res, next) => {
  try {
    const email = req.query.id;
    const reff=req.query.referral
    res.render("otp", { email ,reff});
  } catch (error) {
    next(error);
  }
};

let otp;
const verifyLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const userData = await User.findOne({ email });
    if (userData) {
      const passwordMatch = await bcrypt.compare(password, userData.password);

      if (passwordMatch && !userData.block) {
        req.session.user = userData;
        req.session.cartCount = 0
             let cartData = await Cart.findOne({ user: userData._id })
                if (cartData && cartData.products) {
                  req.session.cartCount = cartData.products.length
                  console.log(req.session.cartCount,"cart count");
                }
        res.redirect(`/home`);
      } else if (!passwordMatch) {
        res.render("login", { message: "Incorrect email or password" });
      } else {
        res.render("login", { message: "You are blocked" });
      }
    } else {
      res.render("login", { message: "User not found" });
    }
  } catch (error) {
    console.log(error.message);
    res.render("login", { message: "An error occurred" });
  }
};

const verifyotp = async (req, res, next) => {
  try {
    const enteredOtp = req.body.code;
    const email = req.body.email;
    console.log(email,"this is the new email");
    const reff=req.body.reff
    console.log(enteredOtp, otp);
    if (enteredOtp == otp) {
      const check=await User.findOneAndUpdate(
        { email: email },
        {
          $set: { isVerified: true },
          $inc: { wallet: 200 },
          $push: {
            walletHistory: {
              date: Date.now(),
              amount: 200,
              type: 'Credit',
              balance: 200,
              details: 'Referral'
            }
          }
        }
      );
      console.log(check);
     const oldUser= await User.findOneAndUpdate(
        { referral: reff },
        { $inc: { wallet: 500 } },
        { new: true }
      );
      const walletbal = oldUser.wallet
      console.log(walletbal);
      await User.findOneAndUpdate(
        { referral: reff },
        {
          $push: {
            walletHistory: {
              date: Date.now(),
              amount: 500,
              type: 'Credit',
              balance: walletbal, 
              details: 'Referral'
            }
          }
        }
      );
      res.redirect("/login");
    } else {
      res.render("otp", { message: "Incorrect OTP" });
    }
  } catch (error) {
    console.log(error.message);
    res.render("otp", { message: "Error occurred during OTP verification" });
  }
};

const forgotPasswordStage1 = async (req, res,next) => {
  try {
    res.render('forgotPassword1',{message:null})
  } catch (error) {
    next(error)
  }
}
const postforgotPasswordStage1 = async (req, res,next) => {
  try {
    const email = req.body.email
    const emailExist = await User.find({ email: email })
    console.log(emailExist);
    if (emailExist.length>0) {
      otp = verificationCode;
      sendMail(req.body.name,email,verificationCode);
      const encodedEmail = encodeURIComponent(email);
      const otpVerifyUrl = `https://watchverse.shop/verifyAddOtp?id=${encodedEmail}`;
      res.redirect(otpVerifyUrl)
    } else {
      res.render('forgotPassword1',{message:"Email not registered"})
    }

  } catch (error) {
    next(error)
  }
}

const forgotPasswordStage2 = async (req, res, next) => {
  try {
    const { id: email } = req.query;
    res.render('forgotPassword2',{email,message:null})
  } catch (error) {
    next(error)
  }
}
const postforgotPasswordStage2 = async (req, res, next) => {
  try {
    const enteredOtp = req.body.code;
    const email = req.body.email;
    console.log(enteredOtp, otp);
    console.log("first check");
    if (enteredOtp == otp) {
      var user=await User.findOne(
        { email: email }
      );
      res.redirect(`/newPassword?id=${user._id}`)
    } else {
      console.log("reached here");
      res.render('forgotPassword2',{email,message:"Wrong OTP"})
    }
    
  } catch (error) {
      next(error)
    }
}
const forgotPasswordStage3 = async (req, res, next) => {
  try {
    const id = req.query.id
      res.render('forgotPassword3',{id:id})
    } catch (error) {
      next(error)
    }
  }
const postforgotPasswordStage3 = async (req, res, next) => {
  try {
    const password = req.body.password
    console.log(password);
    const id = req.query.id
    const hashedPassword = await bcrypt.hash(password, 10);
    await User.updateOne({ _id: id }, { password: hashedPassword });
    res.redirect('/login')
  } catch (error) {
    next(error)
  }
}

function generateAlphanumericCode(length) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let code = '';

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    code += characters.charAt(randomIndex);
  }

  return code;
}

const insertUser = async (req, res, next) => {
  try {
    const { name, email, mobile, password,referral} = req.body;
    const spassword = await securePassword(password);
    const userExists = await User.findOne({ email }).select("email");
    if (userExists) {
      return res.render("register", {
        emailError: "email already exists",
      });
    }
    const refUser = await User.findOneAndUpdate(
      { referral: referral }
    );

    let code=generateAlphanumericCode(5)
    const user = new User({
      name,
      email,
      mobile,
      block: false,
      password: spassword,
      referral: code,
      wallet:0
    });
    const userData = await user.save();
    if (userData) {
      otp = verificationCode;
      console.log(otp);
      sendMail(req.body.name, req.body.email, verificationCode);
      const email = req.body.email;
      const encodedEmail = encodeURIComponent(email);
      // const otpVerifyUrl = `http://localhost:3001/otp-verify?id=${encodedEmail}`;
      const otpVerifyUrl = `http://watchverse.shop/otp-verify?id=${encodedEmail}&referral=${referral}`;
      res.redirect(otpVerifyUrl);
    } else {
      res.render("register", { message: "failed" });
    }
  } catch (error) {
    next(error)
  }
};

const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000);
};

const verificationCode = generateVerificationCode();

const sendMail = (name, email, verificationCode) => {
  const mailTransporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "watchverseonline@gmail.com",
      pass: process.env.nodepass,
      
    },
  });


  const mailOptions = {
    from: "watchverseonline@gmail.com",
    to: email,
    subject: "WatchVerse Login Verification",
    text: `${email}, your verification code is: ${verificationCode}. Do not share this code with anyone.`,
  };

  mailTransporter.sendMail(mailOptions, (err) => {
    if (err) {
      console.log(err);
    } else {
      console.log("Verification code sent successfully");
    }
  });
};

const ProductView = async (req, res, next) => {
  try {
    const productId = req.query.productId;
  const user = req.session.user;

  const product = await Product.findById(productId).populate('Review.user');
  if (product) {
    
  
    const reccprod = await Product.find({ category: product.category })

    const bought = user ? await Order.findOne(
      {
        user: user._id
      },
      {
        products: {
          $elemMatch: { productId: productId }
        }
      }
    ) : null;



    res.render("viewProduct", { product: product, user: user, reccprod, bought });
  } else {
    next(error)
  }
  } catch (error) {
    next(error)
  }
};


const listProducts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 6;
    const category = req.query.category;
    const brand = req.query.brand;
    const searchQuery = req.query.search;
    const selectedCategory = req.query.category || null;
    const selectedBrand = req.query.brand || null;
    const minPrice = parseInt(req.query.minPrice) || null;
    const maxPrice = parseInt(req.query.maxPrice) || null;
    let query = {};
    if (category) {
      query.category = category;
    }
    if (brand) {
      query.brand = brand;
    }
    if (searchQuery) {
      query.$or = [
        { name: { $regex: searchQuery, $options: 'i' } },
        { description: { $regex: searchQuery, $options: 'i' } },
      ];
    }
    if (minPrice !== null && maxPrice !== null) {
      query.price = { $gte: minPrice, $lte: maxPrice };
  }

    const sortingValue = req.query.sort;
    const productCount = await Product.countDocuments(query);
    let products = await Product.find(query)
      .skip((page - 1) * limit)
      .limit(limit);

    if (sortingValue === 'low') {
      products = products.sort((a, b) => a.price - b.price);
    } else if (sortingValue === 'high') {
      products = products.sort((a, b) => b.price - a.price);
    }

    let cart = [];
    if (req.session.user) {
      cart = await Cart.find({ user: req.session.user._id }).populate('products.productId');
    }
    const allbrand = await Product.distinct("brand")
    const categoryData = await Category.find({});
    res.render('listProduct', {
      product: products,
      user: req.session.user,
      cart: cart,
      productCount: productCount,
      page: page,
      limit: limit,
      category: categoryData,
      selectedCategory,
      selectedBrand,
      allbrand,
      cat: category,
      brand,
      minPrice
    });
  } catch (error) {
    next(error);
  }
};


const logOut = async (req, res, next) => {
  try {
    req.session.destroy();
    res.redirect("/login");
  } catch (error) {
    next(error);
  }
};

const userDash = async (req, res, next) => {
  try {
    const user_id = req.session.user._id;
    console.log(user_id);
    const user = await User.findById(user_id);
    if (!user) {
      throw new Error("User not found");
    }

    const userAddress = await Address.find({ user: user_id });
    if (!userAddress) {
      throw new Error("Address not found");
    }

  
    res.render("userAccounts", { user: user, userAddress: userAddress });
  } catch (error) {
    next(error);
  }
};

const viewEditUser = async (req, res, next) => {
  try {
    const user_id = req.session.user._id;
    const user = await User.findById(user_id);
    res.render("user-profile-edit", { user: user });
  } catch (error) {
    next(error);
  }
};

const viewAddress = async (req, res,next) => {
  try {
    const user_id = req.session.user_id;
    const user = await User.findById(user_id);
    res.render("address", { user: user });
  } catch (error) {
    next(error)
  }
};

const loadChangePassword = async (req, res,next) => {
  try {
    const user_id = req.session.user._id;
    const user = await User.findById(user_id);
    res.render("changePassword", { user: user });
  } catch (error) {
    next(error)
  }
};

const changePassword = async (req, res,next) => {
  try {
    const { curr, password } = req.body;
    const userID = req.session.user._id;
    const user = req.session.user;
    const passwordMatch = await bcrypt.compare(curr, user.password);

    if (passwordMatch) {
      const hashedPassword = await bcrypt.hash(password, 10);
      await User.updateOne({ _id: userID }, { password: hashedPassword });
      res.redirect("/user?message=Update%20successful");
    } else {
      res.render("changePassword", { message: "Old password incorrect",user });
    }
  } catch (error) {
    next(error)
  }
};

const editUser = async (req, res,next) => {
  try {
    const { name, mobile } = req.body;
   
    const user = req.session.user;

    const editData = await User.updateOne(
      { _id: user._id },
      { $set: { name: name, mobile: mobile } }
    );
   
    if (editData) {
      res.redirect("/user?message=Update%20successful");
    }
  } catch (error) {
    next(error)
  }
};

const { ObjectId } = require("mongoose").Types;

const editAddress = async (req, res,next) => {
  try {
    const addressid = req.query.id;

    const isValidObjectId = mongoose.isValidObjectId(addressid);
    if (!isValidObjectId) {
      console.log("Invalid Address ID");
      return res.status(400).send("Invalid Address ID");
    }

    const user = await Address.findOne({ user: req.session.user._id });

    if (!user) {
      console.log("User not found");
      return res.status(404).send("User not found");
    }

    const addressObject = user.addressfield.find(
      (address) => address._id.toString() === addressid
    );

    if (!addressObject) {
      console.log("Address not found");
      return res.status(404).send("Address not found");
    }

    console.log("Address Object:", addressObject);

    res.render("editAddress", { address: addressObject, user: user });
  } catch (error) {
    next(error)
    res.status(500).send("Internal Server Error");
  }
};

const editAndUpdate = async (req, res, next) => {
  try {
    const userId = req.session.user._id;
    const addressId = req.query.id;
    const { fullName, mobile_no, address1, district, state, PINcode } =
      req.body;
    await Address.updateOne(
      { user: userId, "addressfield._id": addressId },
      {
        $set: {
          "addressfield.$.fullName": fullName,
          "addressfield.$.mobile_no": mobile_no,
          "addressfield.$.address1": address1,
          "addressfield.$.district": district,
          "addressfield.$.state": state,
          "addressfield.$.PINcode": PINcode,
        },
      }
    );
    console.log("Address updated successfully");
    res.redirect("/user?message=Update%20successful")
  } catch (error) {
    next(error);
  }
};

const deleteAddress = async (req, res, next) => {
  try {
    const addressid = req.query.id;
    const user_id = req.session.user._id;

    const deletedAddress = await Address.updateOne(
      { user: user_id },
      { $pull: { addressfield: { _id: addressid } } }
    );

    if (deletedAddress) {
      console.log("Address deleted successfully!");
      res.redirect('/user')
    } else {
      console.log("Address not found");
    }
  } catch (error) {
    next(error);
  }
};

const checkout = async (req, res, next) => {
  try {
    const user_id = req.session.user._id;

    const user = await User.findById(user_id);
    if (!user) {
      throw new Error("User not found");
    }

    const userAddress = await Address.find({ user: user_id });
    if (!userAddress) {
      throw new Error("Address not found");
    }

  

    const cart = await Cart.findOne({ user: user_id }).populate(
      "products.productId"
    );


    if (!cart || !Array.isArray(cart.products)) {
      throw new Error("Cart not found or empty");
    }

    let cartTotal = 0;
    for (const productItem of cart.products) {
      const price = productItem.productId.price;
      const quantity = productItem.quantity;
      cartTotal += price * quantity;
    }
    cart.Total = cartTotal;
    await cart.save();
    const coupon=await Coupon.find({})
    res.render("checkout", {
      user: user,
      userAddress: userAddress,
      cart: [cart],
      coupons:coupon
    });
  } catch (error) {
    next(error);
  }
};

const viewWishlist = async (req, res, next) => {
  try {
    const user = req.session.user
    const userData = await User.findById(user._id).populate('wishlist')
    const wishlistProducts = [];
    for (const productId of userData.wishlist) {
      const product = await Product.findById(productId);
      wishlistProducts.push(product);
    }
    res.render('wishlist',{user:user,product:wishlistProducts})
  } catch (error) {
    next(error)
  }
}

const addToWishlist = async (req, res, next) => {
  try {
    const item = req.query.id;
    const user = req.session.user;
    const userDoc = await User.findById(user);

    // const isProductInWishlist = userDoc.wishlist.includes(item);

    // if (isProductInWishlist) {
 
    //   await User.findByIdAndUpdate(user, { $pull: { wishlist: item } });
    //   res.redirect(`/product?productId=${item}`)
    // } else {
 
    if (user && item) {
      await User.findByIdAndUpdate(user._id, { $addToSet: { wishlist: item } });
      res.redirect('/wishlist');
      // }
    } else {
      res.redirect('/login')
    }
 
  } catch (error) {
    next(error);
  }
};


const deleteWishlist = async (req, res, next) => {
  try {
    const item= req.query.id
    const user = req.session.user
    await User.findByIdAndUpdate(user._id, { $pull: { wishlist: item } });
    res.redirect('/wishlist')
  } catch (error) {
    next(error)
  }
}

const getaddReview = async (req, res, next) => {
  try {
    const user = req.session.user;
    const id = req.query.id;
    const product = await Product.findById(id);
    if (user) {
      var reviewExists = product.Review.some(review => review.user.equals(user._id));
    }
    let userReview = null;

    if (reviewExists) {
      userReview = product.Review.find(review => review.user.equals(user._id));
    }
   
    res.render('addReview', { user: user, reviewExists: reviewExists, userReview: userReview,product:product._id });
  }catch (error) {
    next(error);
  }
};

const postaddReview = async (req, res, next) => {
  try {
    const userId = req.session.user._id;
    const { rating, title, review, description } = req.body;
    const productId = req.query.id;
    const date = new Date();

    // Find the product and the user's review for that product
    const product = await Product.findById(productId);
    const userReviewIndex = product.Review.findIndex((review) => review.user.toString() === userId);

    if (userReviewIndex !== -1) {
      // If the user has already reviewed the product, update the existing review
      product.Review[userReviewIndex].rating = parseFloat(rating);
      product.Review[userReviewIndex].title = title;
      product.Review[userReviewIndex].review = review;
      product.Review[userReviewIndex].description = description;
      product.Review[userReviewIndex].date = date;
    } else {
      // If the user has not reviewed the product, insert a new review
        product.Review.push({
        user: userId,
        rating: parseFloat(rating),
        title,
        review,
        description,
        date,
      });
    }

    // Recalculate the average rating
    const reviews = product.Review;
    const totalRatings = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRatings / reviews.length;
    product.Rating = averageRating;

    // Save the updated product data
    await product.save();



    res.redirect('/product?productId=' + productId); // Redirect to the product details page or any other appropriate page
  } catch (error) {
    next(error);
  }
};


const viewReviews = async (req, res, next) => {
  try {
    const id = req.query.id
    const user = req.session.user
    const product = await Product.findById(id).populate('Review.user');
  
    res.render('fullReviews', { user: user,product:product })
  } catch (error) {
    next(error)
  }
}

const deleteReview = async (req, res, next) => {
  try {
    const product = req.query.id
    const user=req.session.user
    await Product.findByIdAndUpdate(product, {
      $pull: { Review: { user: user._id } }
    });
    const productMod = await Product.findById(product);
    const reviews = productMod.Review;
    const totalRatings = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = reviews.length > 0 ? totalRatings / reviews.length : 0;
    productMod.Rating = averageRating;
    await productMod.save()
    res.redirect('/product?productId=' + product)
 
  } catch (error) {
    next(error)
  }
}

const wallet = async (req, res, next)=>{
  try {
    const user = req.session.user
    const userData=await User.findById(user._id)
    const walletHistory=userData.walletHistory
    res.render('wallet',{user,walletHistory})
  } catch (error) {
    next(error)
  }
}

const about = async (req, res, next) => {
  try {
    const user=req.session.user
    res.render('aboutUs',{user})
  } catch (error) {
    next(error)
  }
}

const contact = async (req, res, next) => {
  try {
    const user = req.session.user
    res.render('contact',{user})
  } catch (error) {
    next(error)
  }
}

const postContact = async (req, res, next) => {
  try {
    const { name, email, message } = req.body
    contactMail(name, email, message);
    res.redirect('/contact-us?message=sent%20successful')
  } catch (error) {
    next(error)
  }
}


const contactMail = (name, email, message) => {
  const mailTransporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "watchverseonline@gmail.com",
      pass: process.env.nodepass,
      
    },
  });


  const mailOptions = {
    from: "watchverseonline@gmail.com",
    to: "sidharthanand73@gmail.com",
    subject: "WatchVerse Contact",
    text: `${name} with ${email}.The message is: ${message}`,
  };

  mailTransporter.sendMail(mailOptions, (err) => {
    if (err) {
      console.log(err);
    } else {
      console.log("Message sent successfully");
    }
  });
};



module.exports = {
  loadRegister,
  loadHome,
  loadLogin,
  insertUser,
  verifyLogin,
  ProductView,
  listProducts,
  logOut,
  userDash,
  viewAddress,
  loadChangePassword,
  changePassword,
  viewEditUser,
  editUser,
  editAddress,
  deleteAddress,
  editAndUpdate,
  checkout,
  verifyotp,
  acceptotp,
  forgotPasswordStage1,
  postforgotPasswordStage1,
  forgotPasswordStage2,
  postforgotPasswordStage2,
  forgotPasswordStage3,
  postforgotPasswordStage3,
  viewWishlist,
  addToWishlist,
  deleteWishlist,
  getaddReview,
  postaddReview,
  viewReviews,
  wallet,
  about,
  deleteReview,
  contact,
  postContact
};
