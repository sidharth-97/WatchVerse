const modelC = require("../models/couponModel")
const Coupon = modelC
const modelCc = require("../models/cartModel");
const Cart = modelCc.cart;

const viewCoupons = async (req, res,next) => {
    const coupons=await Coupon.find({})
    res.render('coupons',{coupons:coupons})
}

const addCouponsView = async (req, res, next)=>{
    try {
        res.render('addCoupons')
    } catch (error) {
        next(error)
    }
}

const addCoupons = async (req, res, next) => {
    try {
        const { name, expiry, minAmt, description, discount } = req.body
        const coupon = new Coupon({
            name: name,
            description: description,
            expiry_date: expiry,
            discount: discount,
            min_amt: minAmt,
            isActive:true     
        })
        const couponData = await coupon.save()
        if (couponData) {
            res.redirect('/admin/coupons')
        }
    } catch (error) {
        
    }
}

const editCoupons = async (req, res,next) => {
    try {
        const couponId = req.query.id
        const coupon = await Coupon.findById(couponId)
        res.render('editCoupons',{coupons:coupon})
    } catch (error) {
        next(error)
    }
}

const postEditCoupons = async (req, res, next) => {
    try {
        const { name, expiry, minAmt, description, discount } = req.body
        const id = req.query.id
        if (id) {
            await Coupon.findByIdAndUpdate({ _id: id }, {
                $set: {
                    name: name,
                    description: description,
                    expiry_date: expiry,
                    discount: discount,
                    min_amt: minAmt,
            }})
        }
        res.redirect('/coupons')
    } catch (error) {
        next(error)
    }
}

const verifyCoupon = async (req, res, next) => {
    try {
        const couponCode = req.body.coupon;
        const user = req.session.user._id
        const couponStatus = await Coupon.findOne({ name: couponCode })
        req.session.coupon = couponStatus
        const cart = await Cart.findOne({ user: user })
        if (couponStatus && cart.Total>couponStatus.min_amt) {
            const discount = cart.Total * (couponStatus.discount / 100)
            const total = cart.Total - discount     
            res.json({ status: true, newTotal:total,discount:discount});
        } else if(cart.Total<couponStatus.min_amt) {
            res.json({status:false,message:`Minimum purchase of ${couponStatus.min_amt} required`})
        } else if (cart.expiry_date > Date.now()) {
            res.json({status:false,message:"This is an expired coupon"})
        }     
    } catch (error) {
        next(error);
    }
  };
  

module.exports = {
    viewCoupons,
    addCouponsView,
    addCoupons,
    verifyCoupon,
    editCoupons,
    postEditCoupons
}