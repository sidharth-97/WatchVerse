const modelU = require('../models/userModel');
const User = modelU.userS;
const isLogin = async (req, res, next) => {
    if (req.session.user) {
      try {
        const user = await User.findOne({ _id: req.session.user._id }).exec();
        if (user && user.block) {
          req.session.destroy();
          return res.redirect('/login');
        } else {
          return next();
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        return res.redirect('/login');
      }
    } else {
      return res.redirect('/login');
    }
  };
  

const isLogut = (req, res, next) => {
    try {
        if (req.session.user) {
            res.redirect('home')
        } else {
            next()
        }
    } catch (error) {
        console.log(error.message);
    }
}



module.exports = {
    isLogin,
    isLogut,
   
}