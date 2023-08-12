const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
    name: {
        type: String,
        required:true
    },
    description: {
        type:String
    },
    expiry_date: {
        type: Date,
        required:true
    },
    discount: {
        type: Number,
        required:true
    },
    min_amt: {
        type:Number
    },
    isActive: {
        type: Boolean,
        default:true
    },
    users: {
        type:Array
    }
})

module.exports = mongoose.model('Coupon',couponSchema)
