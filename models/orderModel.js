const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    products: [
        {
           
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
                required: true,
            },
            name: {
                type: String,
                required: true,
            },
            price: {
                type: Number,
                required: true, 
            },
            quantity: {
                type: Number,
                required:true
            }
        }
    ],
    orderStatus: {
        type:String
    },
    paymentMode: {
        type: String,
        required:true
    },
    total: {
        type: Number
    },
    date: {
        type:Date
    },
    address: {
        type:Object
    },
    coupon_name: {
        type:String
    },
    discount: {
        type:Number
    },
    walletAmt: {
        type:Number
    }
})

module.exports = mongoose.model('Order', orderSchema)
    


