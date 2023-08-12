const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
    name: {
        type:String
    },
    image: {
        type: String
    },
    link: {
        type: String
    }
});

const Banner = mongoose.model('Banner', bannerSchema);

module.exports = {
    Banner
};
