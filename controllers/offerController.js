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

const offer = async (req, res, next) => {
    try {
        const offer=await Offer.find({})
        res.render('offers',{offer})
    } catch (error) {
        next(error)
    }
}

const status = async (req, res, next) => {
    try {
        const id = req.query.id
        const offer = await Offer.findById(id)
        if (offer) {
            const newStatus = !offer.status
            await Offer.updateOne({_id:id},{$set:{status:newStatus}})
        }
        res.redirect('/admin/offers')
    } catch (error) {
        next(error)
    }
}

const loadeditoffer = async (req, res, next) => {
    try {
        const id = req.query.id
        const offer=await Offer.findById(id)
        res.render('editOffer',{offer})
    } catch (error) {
        next(error)
    }
}

const editoffer = async (req, res, next) => {
    try {
        const id = req.query.id
    
        const { name, expiry, discount } = req.body
        await Offer.findOneAndUpdate({ _id: id }, {
            $set: {
                name: name,
                expiryDate: expiry,
                percentage:discount
        }})
        res.redirect('/admin/offers')
    } catch (error) {
        next(error)
    }
}

module.exports = {
    addOffer,
    getAddOffer,
    offer,
    status,
    loadeditoffer,
    editoffer
}