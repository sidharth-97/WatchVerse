const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required:true
    },
    email: {
        type: String,
        required:true
    },
    mobile: {
        type: String,
        required:true
    },
    password: {
        type: String,
        required:true
    },
    block: {
        type: Boolean,
        required:true
    },
    wallet: {
        type:Number
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    wishlist: {
        type:Array
    },
    referral: {
        type:String
    },
    walletHistory: [
        {
            date: {
                type:Date
            },
            amount: {
                type:Number
            },
            type: {
                type:String
            },
            balance: {
                type:Number
            },
            details: {
                type:String
            }
        }
    ]
        
    

})




 const userS = mongoose.model('User',userSchema) 

 
module.exports = {
    userS,
    
}
