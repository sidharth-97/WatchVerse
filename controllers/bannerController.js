const Banners = require('../models/bannerModel');
const { find } = require('../models/orderModel');
const Banner=Banners.Banner


const getaddBanners = async (req, res, next)=>{
    try {
        const banner=await Banner.find({})
        res.render('banners',{banner:banner})
    } catch (error) {
        next(error)
    }
}

const postaddBanners = async (req, res, next) => {
    try {
        const { bannerNumber, bannerImage, bannerURL } = req.body;
        
        var imageFileName = req.file.filename;
        imageFileName = imageFileName.split('-').slice(1).join('-');
  
      let existingBanner = await Banner.findOne({ name: `banner${bannerNumber}` });
  
      if (existingBanner) {
        existingBanner.image = imageFileName;
        existingBanner.link = bannerURL;
        await existingBanner.save();
      } else {
        const newBanner = new Banner({
          name: `banner${bannerNumber}`,
          image: imageFileName,
          link: bannerURL,
        });
        await newBanner.save();
      }
      res.redirect('/admin/banners')
    } catch (error) {
      next(error);
    }
  };
  

module.exports = {
    getaddBanners,
    postaddBanners
}