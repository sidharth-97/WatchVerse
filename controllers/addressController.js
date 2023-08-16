const modelA = require("../models/addressModel");
const Address = modelA.address;
const modelU = require("../models/userModel");
const User = modelU.userS;


const addAddress = async (req, res,next) => {
    try {
      const user = req.session.user;
      const query = req.query.id || null;
      
      const { fullName, mobile_no, address1, district, state, PINcode } =
        req.body;
      const addressExists = await Address.findOne({ user: user._id });
      if (addressExists) {
        await Address.updateOne(
          { user: user._id },
          {
            $push: {
              addressfield: {
                fullName,
                mobile_no,
                address1,
                district,
                state,
                PINcode,
              },
            },
          }
        );
      } else {
        const address = new Address({
          user: user._id,
          addressfield: [
            {
              fullName,
              mobile_no,
              address1,
              district,
              state,
              PINcode,
            },
          ],
        });
        var addressData = await address.save();
      }
    

      if (query) {
        res.redirect('/checkout')
      } else {
        res.redirect('/user')

      }
    } catch (error) {
      next(error)
    }
  };
  
const getaddressCheck = async (req, res, next)=>{
  try {
      const user=req.session.user
      res.render('addAddressCheckout',{user:user})
    } catch (error) {
      next(error)
    }
  }
const postaddressCheck = async (req, res, next) => {
  try {
    const user = req.session.user;
    const query = req.query.id || null;
  
    const { fullName, mobile_no, address1, district, state, PINcode } =
      req.body;
    const addressExists = await Address.findOne({ user: user._id });
    if (addressExists) {
      await Address.updateOne(
        { user: user._id },
        {
          $push: {
            addressfield: {
              fullName,
              mobile_no,
              address1,
              district,
              state,
              PINcode,
            },
          },
        }
      );
    } else {
      const address = new Address({
        user: user._id,
        addressfield: [
          {
            fullName,
            mobile_no,
            address1,
            district,
            state,
            PINcode,
          },
        ],
      });
      var addressData = await address.save();
    }
  

    if (addressData) {
      res.redirect('/checkout')
    }
  } catch (error) {
    next(error)
  }
}


module.exports = {
  addAddress,
  getaddressCheck,
  postaddressCheck
};
