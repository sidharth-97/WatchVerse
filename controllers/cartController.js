const modelC = require("../models/cartModel");
const Cart = modelC.cart;

const modelP = require("../models/productModel");
const ProductM = modelP.product;



const addToCart = async (req, res,next) => {
    try {
        const userId = req.session.user._id;
        const productId = req.query.productId;
        const Product = await ProductM.findById(productId);
        const price = Product.price;
        const quantity =1;

        const total = price * quantity;

        const userExists = await Cart.findOne({ user: userId });

        if (userExists) {
            const cartExists = await Cart.findOne({
                user: userId,
                products: {
                    $elemMatch: { productId: productId }
                }
            });

            if (cartExists) {
                res.redirect('/cart');
            } else {
              
                await Cart.updateOne(
                    { user: userId },
                    {
                        $addToSet: {
                            products: {
                                productId: productId,
                                quantity,
                                price: price
                            }
                        },$inc: { Total: price }
                    }
                );
                req.session.cartCount = 0
                let cartData = await Cart.findOne({ user: userId })
                if (cartData && cartData.products) {
                    req.session.cartCount = cartData.products.length
                }
                res.redirect('/cart');
            }
        } else {
            await new Cart({
                user: userId,
                products: [{
                    productId: productId,
                    quantity,
                    price: price
                }],
                Total:total
            }).save();
         
            res.redirect('/cart');      
        }
    } catch (error) {
        next(error)
    }
};

const viewCart = async (req, res,next) => {
    try {
        const userId = req.session.user._id;
        const user=req.session.user
        const carts = await Cart.find({ user: userId }).populate("products.productId");

        if (carts.length === 0) {
           
            return res.render("cartError",{user:user});
        }

        carts.forEach(cart => {
            let cartTotal = 0;
            cart.products.forEach(product => {
                const price = product.productId.price;
                const quantity = product.quantity;
                cartTotal += price * quantity;
            });
            cart.Total = cartTotal;
        });

        res.render("cart", { carts: carts, user:user });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};





const updateCart = async (req, res,next) => {
    try {
        const user = req.session.user;
        const quantity = parseInt(req.body.amt);
        const prodId = req.body.productId;

        const product = await ProductM.findOne({ _id: prodId });
        console.log("Product:", product);

        const stock = product.quantity;
        const price = quantity * product.price;
        console.log("User:", user);
        console.log("Quantity:", quantity);
        console.log("Product ID:", prodId);

        if (stock >= quantity) {
            await Cart.updateOne(
                { user: user._id, 'products.productId': prodId },
                { $set: { 'products.$.quantity': quantity, 'products.$.price': price } }
            );

            let cartData = await Cart.find({ user: user._id }).populate('products.productId');
            let [{ products }] = cartData;

       
            let Total = products.reduce((acc, curr) => acc += curr.price, 0);

            await Cart.updateOne({ user: user._id }, { $set: { Total: Total } });

            res.json({ status: true, data: { st: 'worked', price, Total } });
            
        } else {
            res.json({ status: false, data: 'out of stock' });
        }

    } catch (error) {
        next(error)
    }
};

const deleteCart = async (req, res, next) => {
    try {
        const product = req.query.productId
        const user = req.session.user
        if (product) {
            await Cart.updateOne(
            { user: user._id},
            { $pull:{products:{ productId:product}} }
            );
            req.session.cartCount = 0
            let cartData = await Cart.findOne({ user: user._id })
            if (cartData && cartData.products) {
                req.session.cartCount = cartData.products.length
            }
            res.redirect('/cart')
        } else {
            res.redirect('/cart')
        }
    } catch (error) {
        next(error)
    }
  
}

    
module.exports = {
    addToCart,
    viewCart,
    updateCart,
    deleteCart,
};

