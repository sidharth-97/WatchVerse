const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required:true
    },
    price: {
        type: Number,
        required:true
    },
    description: {
        type: String,
        required:true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,  // Update the field type to ObjectId
        ref: 'Category',  // Specify the referenced model name
        required: true
    },
    strapType: {
        type: String,
        required:true
    },
    brand: {
        type: String,
        required:true
    },
    quantity: {
        type: Number,
        required:true
    },
  
    offer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Offer'
    },
    discount:{
        type: Number,
    },
    image: Array
    ,
    isListed: {
        type: Boolean,
        default:true
    },
    Rating: {
        type:Number
    },
    Review: [
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                required: true,
            },
            rating: {
                type:Number
            },
            title: {
                
            },
            description: {
                type:String
            },
            date: {
                type:Date
            }
        }
    ]
})

const product=mongoose.model('Product',productSchema)

module.exports = {
    product
}