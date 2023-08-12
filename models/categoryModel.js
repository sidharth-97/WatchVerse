const mongoose = require('mongoose');
const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    isListed: {
        type: Boolean,
        required:true
    },
    offer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Offer'
    },
    image: {
        type:String
    }
})

const category = mongoose.model('Category', categorySchema)

module.exports = {
    category
}