const modelC=require('../models/categoryModel');
const Category = modelC.category
const modelP=require('../models/productModel');
const Product = modelP.product
const Offer = require("../models/offerModel");
const schedule = require('node-schedule')

const addProduct = async (req,res,next) => {
    try {
        const { name, price, category, description, strapType, brand, quantity } = req.body
        let image = []
        for (const file of req.files) {
            image.push(file.filename)
        }
        const product = new Product({
            name,
            price,
            category,
            description,
            strapType,
            brand,
            quantity,
            image
        })
        const productData = await product.save()
        if (productData) {
            res.redirect('/admin/products')
        }
    } catch (error) {
        next(error)
    }
}
const viewProductPage = async (req,res,next) => {
    try {
        const categoryData=await Category.find({}).populate('offer')
        res.render('addProduct',{category:categoryData})
    } catch (error) {
        next(error)
    }
}

const viewProduct= async (req,res,next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const offers=await Offer.find({})
    const productCount = await Product.countDocuments({});
    const productData = await Product.find({}).populate('category')
    
      
        res.render('products',{product:productData, productCount: productCount,
          page: page,
          offers,
          limit: limit})
    } catch (error) {
        next(error)
    }
}

const viewEditProduct = async (req,res,next) => {
    try {
        const id = req.params.id; 
        const product = await Product.findById(id);
        const categoryData = await Category.find({});
        res.render('editProduct', { category: categoryData, product: product });
    } catch (error) {
        next(error)
    }
}
const editProduct = async (req,res,next) => {
    try {
      const id = req.params.id;
      const { name, price, quantity, description, brand, model, category, strapType } = req.body;
  
      if (req.files) {
        let newImages = [];
        for (let file of req.files) {
          newImages.push(file.filename);
        }
        await Product.findOneAndUpdate({ _id: id }, { $push: { image: { $each: newImages } } });
      }
  
      const product = await Product.findById(id);
      if (product) {
        await Product.updateOne(
          { _id: id },
          {
            $set: {
              name: name,
              price: price,
              quantity: quantity,
              description: description,
              brand: brand,
              model: model,
              category: category,
              strapType: strapType
            }
          }
        );
        res.redirect('/admin/products')
      } else {
        res.send("Product not found");
      }
    } catch (error) {
      next(error)
    }
  };
  

const imageDelete = async (req,res,next) => {
    try {
        const id = req.params.id
        const imageURL = req.query.imageURL
        await Product.findOneAndUpdate({ _id: id }, { $pull: { image: imageURL } })
        res.redirect(`/admin/products/edit-products/${id}`);
    } catch (error) {
        next(error)
    }
}
const prodStatus = async (req, res, next)=>{
  try {
    const productId = req.query.id
    
    const product = await Product.findById(productId)
    if (product) {
      const newStatus = !product.isListed
      await Product.updateOne({_id:productId},{isListed:newStatus})
    }
      res.redirect('/admin/products')
  } catch (error) {
      next(error)
  }
}
const prodOffer = async (req, res,next) => {
  try {
    const { offerName } = req.body;
    const id = req.body.productId

    var product = await Product.findById(id);
    const offers = await Offer.find({ name: offerName })
    if (offers) {
      const offer = offers[0]
      const offerPercentage = offer.percentage;
      const discountAmount = (offerPercentage / 100) * product.price; 
      const discountedPrice = product.price - discountAmount;
      await Product.findByIdAndUpdate(id, { $set: { offer: id,price: discountedPrice,discount:discountAmount } });
      if (offer.expiryDate) {
        const expiryDate = new Date(offer.expiryDate);
        console.log(expiryDate, "expiry date");
        const currentDateTime = new Date();
        console.log(currentDateTime.toISOString());
        if (expiryDate <= new Date()) {
          console.log('Expiry date is in the past or at the current time. Job not scheduled.');
        } else {
          console.log('Scheduling job for:', expiryDate);
          const jobName = `${product.name}`;

          schedule.scheduleJob(jobName, expiryDate, async () => {
            await Product.findByIdAndUpdate(id, { $unset: { offer: 1 } });

            const updatedProduct = await Product.findOne({_id:id });
              const originalPrice = updatedProduct.discount
              await Product.updateOne(
                { _id: id },
                {
                  $set: {
                    price: originalPrice,
                  },
                }
              );
          });
          res.redirect('/admin/products')
        }
      } else {
      console.log("not done");
      }
    }
  } catch (error) {
    next(error)
  }
}

const cancelProdOffer = async (req, res, next) => {
  try {
    const productQ = req.query.product
    const offerQ = req.query.offer
    var product = await Product.findById(productQ);
    const offers = await Offer.find({ _id: offerQ })
    if (offers) {
      const offer = offers[0]
      await Product.findByIdAndUpdate(productQ, { $unset: { offer: 1 } });

      const updatedProduct = await Product.findOne({ _id: productQ });
      const originalPrice = updatedProduct.discount
      await Product.updateOne(
        { _id: productQ },
        {
          $inc: {
            price: originalPrice,
          }
        },
          {
            $unset:{discount:1}
          }
      );
      res.redirect('/admin/products')
    }
  } catch (error) {
    next(error)
  }
}

module.exports = {
    addProduct,
    viewProduct,
    viewProductPage,
    viewEditProduct,
    editProduct,
    imageDelete,
    prodStatus,
    prodOffer,
    cancelProdOffer
}
