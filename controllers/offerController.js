const Offer = require("../models/offerModel");

const addOffer = async (req, res, next) => {
    try {
        const { name, expiry, discount } = req.body
        const offer = new Offer({
            name: name,
            expiryDate: expiry,
            percentage: discount,
            status:true
        })
        const offerData= await offer.save()
    } catch (error) {
        next(error)
    }
}
const getAddOffer = async (req, res, next) => {
    try {
        res.render('addOffer')
    } catch (error) {
        next(error)
    }
}

module.exports = {
    addOffer,
    getAddOffer
}