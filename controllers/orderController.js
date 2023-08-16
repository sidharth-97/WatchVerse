// require('dotenv').config()
const modelO = require("../models/orderModel");
const Order = modelO;
const modelA = require("../models/addressModel");
const Address = modelA.address;
const modelC = require("../models/cartModel");
const Cart = modelC.cart;
const modelP = require("../models/productModel");
const Product = modelP.product;
const modelU = require("../models/userModel");
const User = modelU.userS;
const modelCo = require("../models/couponModel")
const Coupon = modelCo
const Razorpay = require("razorpay");
const crypto = require("crypto");
const { findOneAndUpdate } = require("../models/couponModel");
const { RAZORPAY_ID_KEY, RAZORPAY_KEY_SECTET } = process.env;
const easyinvoice = require('easyinvoice');

var instance = new Razorpay({
  key_id: "rzp_test_FcpTaEapa4GL0L",
  key_secret: "7laMKCS4aOvNXNnpbLzJsRd1",
});

const addOrder = async (req, res,next) => {
  try {
    const user = req.session.user;
    const addID = req.body.selectedCard;
    const paymentMode = req.body.paymentMethod;
    const walletBalance = req.body.walletBalance; 
    console.log(walletBalance,"the form wallet");
    

    const address = await Address.findOne({
      user: user._id,
      "addressfield._id": addID,
    });

    const addressObject = address.addressfield.find(
      (address) => address._id.toString() === addID
    );

    const cartData = await Cart.findOne({ user: user._id }).populate(
      "products.productId"
    );
    let productList = cartData.products.map(
      ({ productId, quantity, price }) => ({
        productId,
        name: productId.name,
        price: productId.price,
        quantity,
      })
    );
    var total = productList.reduce((acc, item) => acc + item.price * item.quantity, 0)
    console.log(total,"total");
    let updatedWalletBalance = user.wallet;

    if (walletBalance) {
      if (walletBalance >= total) {
    
        updatedWalletBalance = walletBalance - total
        
      } else {
        updatedWalletBalance = 0; 
        total -= walletBalance; 
      }
    }

    console.log(total, "total is here");
    console.log(updatedWalletBalance,"new balance");

    const date = new Date();

    const coupon = req.session.coupon;
    if (coupon) {
      var finalTotal = total - total * (coupon.discount / 100);
      await Coupon.updateOne({ _id: coupon._id }, { $push: { users: user._id } });
    } else {
      var finalTotal = total;
    }

    var cname = "";
    if (coupon) {
      cname = coupon.name;
    }
    var wallet = 0

    if (walletBalance) {
      if (walletBalance >= total) {
        wallet=walletBalance-total
      } else {
        wallet=walletBalance
      }
    }

    console.log(wallet,"after the condition");

    if (paymentMode == 'Wallet') {
      var stat="Paid using wallet"
    } else {
      stat='pending'
    }

    const newOrder = await new Order({
      user: user._id,
      date: date,
      products: productList,
      orderStatus: stat,
      paymentMode: paymentMode,
      address: addressObject,
      total: finalTotal,
      coupon_name: cname,
      walletAmt:wallet
    }).save();

    for (const { productId, quantity } of productList) {
      await Product.updateOne(
        { _id: productId._id },
        { $inc: { quantity: -quantity } }
      );
    }

    console.log(finalTotal, "to check");
    console.log(updatedWalletBalance,"to check");
    await User.updateOne({ _id: user._id }, { $set: { wallet: updatedWalletBalance } });
    if (walletBalance && paymentMode !=='Wallet') {
      await User.findOneAndUpdate(
        { _id: user._id },
        {
          $push: {
            walletHistory: {
              date: Date.now(),
              amount: finalTotal,
              type: 'Debit',
              balance: updatedWalletBalance, 
              details: paymentMode
            }
          }
        }
      ); 
    }
 
    // await Cart.deleteOne({ user: user._id });

    if (newOrder && paymentMode == "COD") {
      await Cart.deleteOne({ user: user._id });
      req.session.cartCount = 0
      let cartData1 = await Cart.findOne({ user: user._id })
         if (cartData1 && cartData1.products) {
           req.session.cartCount = cartData1.products.length
           console.log(req.session.cartCount,"cart count");
         }
      res.json({ codSucess: true });
    } else if (paymentMode == 'Wallet') {
      await Cart.deleteOne({ user: user._id });
      await User.findOneAndUpdate(
        { _id: user._id },
        {
          $push: {
            walletHistory: {
              date: Date.now(),
              amount: finalTotal,
              type: 'Debit',
              balance: updatedWalletBalance, 
              details: 'Wallet payment'
            }
          }
        }
      ); 
      req.session.cartCount = 0
      let cartData1 = await Cart.findOne({ user: user._id })
         if (cartData1 && cartData1.products) {
           req.session.cartCount = cartData1.products.length
           console.log(req.session.cartCount,"cart count");
         }
      res.json({ codSucess: true });
    } else{
      var options = {
        amount: finalTotal * 100,
        currency: "INR",
        receipt: newOrder._id.toString(),
      };
      instance.orders.create(options, function (err, order) {
        console.log(order);
        res.json({ status: true, total: finalTotal, order: order });
      });
    }
   
  } catch (error) {
   next(error)
  }
};

const viewUserOrder = async (req, res, next) => {
  try {
    const user = req.session.user;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 6;
    const orderCount = await Order.countDocuments({});
    const orders = await Order.find({ user: user._id }).populate(
      "products.productId"
    ).skip((page - 1) * limit)
    .limit(limit);
    res.render("orders", { user: user, orders: orders,page,limit,orderCount });
  } catch (error) {
    next(error);
  }
};

const orderDetails = async (req, res, next) => {
  try {
    const user = req.session.user;
    const orderId = req.query.id;
    const orders = await Order.find({ _id: orderId }).populate(
      "products.productId"
    );
    console.log("address");
    console.log(orders);

    res.render("orderDetails", { user: user, orders: orders });
  } catch (error) {
    next(error);
  }
};

const cancelOrder = async (req, res, next) => {
  try {
    const order = req.query.id;
    const user = req.session.user;
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, "0"); 
    const day = String(currentDate.getDate()).padStart(2, "0");

    const formattedDate = `${year}-${month}-${day}`;
    const orderfind = await Order.find({ _id: order });

    if (orderfind.length > 0) {
      var orderData = orderfind[0];
   console.log("before condition");

      if (orderData.paymentMode == 'COD' && orderData.walletAmt) {
        console.log("reached cod");
        await User.updateOne(
          { _id: user._id },
          { $inc: { wallet: orderData.walletAmt } } 
        );
        const walletAmt=req.session.user.wallet
        await User.findOneAndUpdate(
          {_id: user._id },
          {
            $push: {
              walletHistory: {
                date: Date.now(),
                amount: orderData.walletAmt,
                type: 'Credit',
                balance: walletAmt, 
                details: 'Order Cancelletion'
              }
            }
          }
        );
      } else {
        console.log("reached else");
        await User.updateOne(
          { _id: user._id }, 
          { $inc: { wallet: orderData.total} } 
        );
        const walletAmt=req.session.user.wallet
        await User.findOneAndUpdate(
          {_id: user._id },
          {
            $push: {
              walletHistory: {
                date: Date.now(),
                amount: orderData.walletAmt,
                type: 'Credit',
                balance: walletAmt, 
                details: 'Order Cancelletion'
              }
            }
          }
        );
      }
      await Order.findOneAndUpdate(
        { _id: order },
        { $set: { orderStatus: "Cancelled by user on " + formattedDate } }
      );

      console.log(user.wallet);
      res.redirect("/orders");
    } else {
      console.log("Order not found");
      res.redirect("/orders");
    }
  } catch (error) {
    next(error);
  }
};

const returnOrder = async (req, res, next) => {
  try {
    const order = req.query.id
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, "0"); 
    const day = String(currentDate.getDate()).padStart(2, "0");
    const formattedDate = `${year}-${month}-${day}`;
    await Order.findOneAndUpdate(
      { _id: order },
      { $set: { orderStatus: "Return Requested" } }
    );

    
  } catch (error) {
    next(error)
  }
}


const adminOrder = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 6;
    const orders = await Order.find({}).populate("products.productId")
    const userIds = orders.map((order) => order.user);
    const users = await User.find({ _id: { $in: userIds } });

    const orderCount = await Order.countDocuments({});
    console.log(orders);

    const ordersWithUser = orders.map((order) => {
      const user = users.find(
        (user) => user._id.toString() === order.user.toString()
      );
      return { ...order._doc, user };
    });
    console.log(users);

    res.render("orderListing", { orders: ordersWithUser,page,limit,orderCount});
  } catch (error) {
    next(error);
  }
};

const orderStatus = async (req, res,next) => {
  try {
    const id = req.query.id;
 
    const newStatus = req.body.status;
 

    const order = await Order.findById(id);
 
    if (order) {
      order.orderStatus = newStatus;
      await order.save();
    }
    res.json({ message: "Status updated successfully" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "Error updating status" });
  }
};

const payment = async (req, res, next) => {
  try {
    const details = req.body;
    const user=req.session.user
    console.log("Received details:", details);

    const hmacData =
      details.payment.razorpay_order_id +
      "|" +
      details.payment.razorpay_payment_id;
    console.log("HMAC data:", hmacData);

    let hmac = crypto.createHmac("sha256", "7laMKCS4aOvNXNnpbLzJsRd1");
    hmac.update(hmacData);
    hmac = hmac.digest("hex");
    console.log("Generated HMAC:", hmac);

    const razorpaySignature = details.payment.razorpay_signature;
    console.log("Razorpay Signature:", razorpaySignature);

    if (hmac == razorpaySignature) {
      const order_id = details.order.receipt;
      console.log("Order ID:", order_id);

      const order = await Order.findOneAndUpdate(
        { _id: order_id },
        { $set: { paymentMode: "Pay Online(Paid)" } }
        // { new: true }
      );

      if (!order) {
        console.log("Order not found");
      } else {
        console.log("Payment done. Order status updated.");
        await Cart.deleteOne({ user: user._id });
        req.session.cartCount = 0
             let cartData = await Cart.findOne({ user: user._id })
                if (cartData && cartData.products) {
                  req.session.cartCount = cartData.products.length
                  console.log(req.session.cartCount,"cart count");
                }
        res.json({ paymentSuccess: true });
      }
    } else {
      console.log("Not match. Payment verification failed.");
      res.json({ paymentSuccess: false });
    }
  } catch (error) {
    next(error);
  }
};

const paymentSucess = async (req, res,next) => {
  try {
    const user=req.session.user
    res.render("payment-sucess",{user:user});
  } catch (error) {
   next(error)
  }
};

const approveReturn = async (req, res,next) => {
  try {
    const id = req.query.id
    await Order.findOneAndUpdate({ _id: id }, { $set: { orderStatus: "Return Approved" } })
    res.redirect('/admin/orders')
  } catch (error) {
    next(error)
  }
}

const downloadInvoice = async (req, res, next) => {
  try {
   
      const orderId = req.query.id;
    const order = await Order.findById(orderId).populate('user');
    console.log(order.user.name);
      var data = {
        // Customize enables you to provide your own templates
        // Please review the documentation for instructions and examples
        "customize": {
          //  "template": fs.readFileSync('template.html', 'base64') // Must be base64 encoded html 
        },
        "images": {
          // The logo on top of your invoice
          "logo": "https://i.ibb.co/cr1hjVK/logo.png",
          // The invoice background
          "background": "https://public.easyinvoice.cloud/img/watermark-draft.jpg"
        },
        // Your own data
        "sender": {
          "company": "WatchVerse",
          "address": "Kannur, Kerala",
          "zip": "1234",
          "city": "Kannur",
          "country": "India"
          //"custom1": "custom value 1",
          //"custom2": "custom value 2",
          //"custom3": "custom value 3"
        },
        // Your recipient
        "client": {
          "company": order.user.name,
          "address": order.address.address1,
          "zip": order.address.PINcode,
          "city": order.address.district,
          "country": order.address.state
          // "custom1": "custom value 1",
          // "custom2": "custom value 2",
          // "custom3": "custom value 3"
        },
        "information": {
          // Invoice number
          "Invoice number": orderId,
          // Invoice data
          "date": order.date,
          // Invoice due date
          // "due-date": "31-12-2021"
        },
        // The products you would like to see on your invoice
        // Total values are being calculated automatically
        "products": order.products.map(product => ({
          "quantity": product.quantity,
          "description": product.name,
          "tax-rate": 18, // You can add tax rate here if you have it in the database
          "price": (product.price)/1.18
        })),
        // Add other details like payment information, total amount, etc.
        "payment": {
          "method": order.paymentMode // Assuming you have a paymentMode field in your Order model
        },
        // "bottom-notice": "Kindly pay your invoice within 15 days.",
        "footer": {
          "text": "Thank you for your business!"
        },
        "settings": {
          "currency": "INR" // Change to the appropriate currency based on your order data
        },
        // Translate your invoice to your preferred language
        "translate": {
          // "invoice": "FACTUUR",  // Default to 'INVOICE'
          // "number": "Nummer", // Defaults to 'Number'
          // "date": "Datum", // Default to 'Date'
          // "due-date": "Verloopdatum", // Defaults to 'Due Date'
          // "subtotal": "Subtotaal", // Defaults to 'Subtotal'
          // "products": "Producten", // Defaults to 'Products'
          // "quantity": "Aantal", // Default to 'Quantity'
          // "price": "Prijs", // Defaults to 'Price'
          // "product-total": "Totaal", // Defaults to 'Total'
          // "total": "Totaal", // Defaults to 'Total'
          "gst": "GST"
        },
      }
    
  const result = await easyinvoice.createInvoice(data);


  res.set('Content-Disposition', 'attachment; filename="invoice.pdf"');
  res.set('Content-Type', 'application/pdf');
  res.send(Buffer.from(result.pdf, 'base64'));

  } catch (error) {
    next(error)
  }
}

module.exports = {
  addOrder,
  viewUserOrder,
  orderDetails,
  adminOrder,
  orderStatus,
  payment,
  paymentSucess,
  cancelOrder,
  approveReturn,
  downloadInvoice,
  returnOrder
};
