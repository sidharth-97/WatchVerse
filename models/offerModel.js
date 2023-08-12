const mongoose = require('mongoose');


const offerShema = new mongoose.Schema({
    name: {
        type:String
    },
    startingDate: {
        type:Date
    },
    expiryDate: {
        type:Date
    },
    percentage: {
        type:Number
    },
    status: {
        type:Boolean
    }
})

module.exports=mongoose.model('Offer',offerShema)