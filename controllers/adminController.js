const modelU = require("../models/userModel");
const User = modelU.userS;
const modelA = require("../models/adminModel");
const Admin = modelA.admin;
const modelC = require("../models/categoryModel");
const Category = modelC.category;
const Offer = require("../models/offerModel");
const schedule = require("node-schedule");
const modelP = require("../models/productModel");
const Product = modelP.product;
const modelO = require("../models/orderModel");
const Order = modelO;
const exceljs = require("exceljs");

const bcrypt = require("bcrypt");
const { orderStatus } = require("./orderController");

const loadLogin = async (req, res, next) => {
  try {
    let message = req.app.locals.message;
    req.app.locals.message = null;
    res.render("adminlogin", { message });
  } catch (error) {
    next(error);
  }
};

const verifyLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const adminData = await Admin.findOne({ email });
    if (adminData) {
      const passwordMatch = await bcrypt.compare(password, adminData.password);
      if (passwordMatch) {
        req.session.admin = adminData;
        res.redirect("/admin/dashboard");
      } else {
        // res.render("adminlogin", { message: "Incorrect email or password" });
        req.app.locals.message = "Incorrect email or password";
        res.redirect("/admin");
      }
    } else {
      // res.render("adminlogin", { message: "Incorrect email or password" });
      req.app.locals.message = "Incorrect email or password";
      res.redirect("/admin");
    }
  } catch (error) {
    next(error);
  }
};

const loadDashboard = async (req, res, next) => {
  try {
    if (req.query.year) {
      var year = req.query.year;
    } else {
      var year = "2023";
    }
    const yearData = await Order.aggregate([
      {
        $match: { orderStatus: "Delivered" },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y", date: "$date" } },
        },
      },
      {
        $sort: { _id: -1 },
      },
    ]);
    const allYears = yearData.map((item) => item._id);
    let matchStage = { orderStatus: "Delivered" };

    if (year) {
      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year, 11, 31, 23, 59, 59);
      matchStage.date = { $gte: startDate, $lte: endDate };
    }

    const data = await Order.aggregate([
      {
        $match: matchStage,
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
          totalAmount: { $sum: "$total" },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);
    const uniqueMonths = {};
    const totalAmounts = [];

    data.forEach((item) => {
      const date = new Date(item._id);
      const monthName = date.toLocaleString("en-US", { month: "long" });

      if (!uniqueMonths[monthName]) {
        uniqueMonths[monthName] = item.totalAmount;
      } else {
        uniqueMonths[monthName] += item.totalAmount;
      }
    });

    for (const month in uniqueMonths) {
      totalAmounts.push(uniqueMonths[month]);
    }

    const uniqueMonthsArray = Object.keys(uniqueMonths);

    //for pie chart
    const paymentData = await Order.aggregate([
      { $match: { orderStatus: "Delivered" } },

      {
        $group: { _id: "$paymentMode", count: { $sum: 1 } },
      },
    ]);
    const paymentModeArray = paymentData.map((item) => item._id);

    const paymentCountArray = paymentData.map((item) => item.count);

    //for category chart
    const aggregatedOrder = await Order.aggregate([
      {
        $unwind: "$products",
      },
      { $match: { orderStatus: "Delivered" } },
      {
        $lookup: {
          from: "products",
          localField: "products.productId",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      {
        $unwind: "$productDetails",
      },
      {
        $group: {
          _id: "$productDetails.category",
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    const objectIdsArray = aggregatedOrder.map((order) => order._id);
    const catCountArray = aggregatedOrder.map((order) => order.count);

    const categoriesArray = await Category.find(
      { _id: { $in: objectIdsArray } },
      "name"
    );
    const namesArray = categoriesArray.map((category) => category.name);

    //for user number

    const userCount = await User.countDocuments({});

    //revenue generated
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();

    const yearDataa = await Order.aggregate([
      {
        $match: {
          orderStatus: "Delivered",
          date: {
            $gte: new Date(currentYear, currentMonth, 1), // Start of the current month
            $lt: new Date(currentYear, currentMonth + 1, 1), // Start of the next month
          },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$date" } },
          totalSales: { $sum: "$total" }, // Assuming the sales total is stored in the "total" field
        },
      },
      {
        $sort: { _id: -1 },
      },
    ]);

    const totalSalesForCurrentMonth =
      yearDataa.length > 0 ? yearDataa[0].totalSales : 0;

    //order pending
    const ordersPending = await Order.aggregate([
      {
        $match: {
          orderStatus: "pending",
        },
      },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
        },
      },
    ]);

    // The count of pending orders will be available in the 'ordersPending' array
    const countPendingOrders =
      ordersPending.length > 0 ? ordersPending[0].count : 0;

    //the sales report

    let fromdate = req.query.fromDate;
    let todate = req.query.toDate;

    if (fromdate && todate) {
      fromdate = new Date(fromdate);
      todate = new Date(todate);
      todate = new Date(todate.getTime() + 1 * 24 * 60 * 60 * 1000);
      console.log("here");
      var order = await Order.find({
        orderStatus: "Delivered",
        date: { $gte: fromdate, $lte: todate },
      })
        .populate("user")
        .populate("products.productId");
    } else {
      var order = await Order.find({
        orderStatus: "Delivered",
      })
        .populate("user")
        .populate("products.productId");
    }

    const currDate = new Date();
    console.log(currDate);

    res.render("dashboard", {
      uniqueMonthsArray,
      totalAmounts,
      allYears,
      year,
      paymentModeArray,
      paymentCountArray,
      namesArray,
      catCountArray,
      userCount,
      totalSalesForCurrentMonth,
      order,
      countPendingOrders,
      currDate,
    });
  } catch (error) {
    next(error.message);
  }
};

const viewUsers = async (req, res, next) => {
  try {
    const search = "";
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 7;
    const userCount = await User.countDocuments({});
    const userData = await User.find({})
      .skip((page - 1) * limit)
      .limit(limit);
    res.render("users", {
      users: userData,
      userCount: userCount,
      page: page,
      limit: limit,
    });
  } catch (error) {
    next(error);
    res.render("users", { users: [] });
  }
};

const blockUser = async (req, res, next) => {
  try {
    const id = req.query.id;
    const user = await User.findById(id);
    if (user) {
      const newBlockStatus = !user.block;
      await User.updateOne({ _id: id }, { $set: { block: newBlockStatus } });
    }
    res.redirect("/admin/user");
  } catch (error) {
    next(error);
  }
};

const viewCategory = async (req, res, next) => {
  try {
    const offer = await Offer.find({});
    const category = await Category.find({}).populate("offer");
    res.render("category", { category: category, offers: offer });
  } catch (error) {
    next(error);
    res.render("users", { users: [] });
  }
};

const addCategory = async (req, res, next) => {
  try {
    const name = req.body.name;
    var imageFileName = req.file.filename;
    imageFileName = imageFileName.split("-").slice(1).join("-");
    const category = await Category.find({});
    const categoryExists = await Category.find({ name: name });
    if (categoryExists.length > 0) {
      res.render("category", {
        message: "Category Already Exists",
        category: category,
      });
    } else {
      const category = new Category({
        name,
        isListed: true,
        image: imageFileName,
      });

      const categoryData = await category.save();
      if (categoryData) {
        console.log(categoryData);
      }
      res.redirect("/admin/category");
    }
  } catch (error) {
    next(error);
  }
};

const editCategory = async (req, res, next) => {
  try {
    const newName = req.body.newName;
    const id = req.body.id;
    var imageFileName = req.file.filename;
    imageFileName = imageFileName.split("-").slice(1).join("-");
    const category = await Category.findById(id);
    console.log(category);
    if (category) {
      await Category.updateOne(
        { _id: id },
        { $set: { name: newName, image: imageFileName } }
      );
    }
    res.redirect("/admin/category");
  } catch (error) {
    next(error);
  }
};

const addOfferCategory = async (req, res, next) => {
  try {
    const { offerName } = req.body;
    const id = req.body.categoryId;

    const category = await Category.findById(id);
    const offers = await Offer.find({ name: offerName });

    if (category && offers.length > 0) {
      const offer = offers[0];
      const offerPercentage = offer.percentage;
      await Category.findByIdAndUpdate(id, { $set: { offer: offer._id } });

      const productsInCategory = await Product.find({ category: category._id });
      console.log(productsInCategory, "products inc ");
      for (const product of productsInCategory) {
        const discountAmount = (offerPercentage / 100) * product.price;
        const discountedPrice = product.price - discountAmount;
        await Product.updateOne(
          { _id: product._id },
          {
            $set: {
              price: discountedPrice,
              discount: discountAmount,
            },
          }
        );
        if (offer.expiryDate) {
          const expiryDate = new Date(offer.expiryDate);
          console.log(expiryDate, "expiry date");
          const currentDateTime = new Date();
          console.log(currentDateTime.toISOString());
          if (expiryDate <= new Date()) {
            console.log(
              "Expiry date is in the past or at the current time. Job not scheduled."
            );
          } else {
            console.log("Scheduling job for:", expiryDate);
            const jobName = `${category.name}`;

            schedule.scheduleJob(jobName, expiryDate, async () => {
              await Category.findByIdAndUpdate(id, { $unset: { offer: "" } });
              const updatedProductsInCategory = await Product.find({
                category: category._id,
              });

              for (const product of updatedProductsInCategory) {
                const originalPrice = product.discount;
                await Product.updateOne(
                  { _id: product._id },
                  {
                    $inc: {
                      price: originalPrice,
                    },
                  }
                );
              }
            });
          }
        } else {
        }
      }
      res.redirect("/admin/category");
    }
  } catch (error) {
    next(error);
  }
};

const cancelOffer = async (req, res, next) => {
  try {
    console.log("entered");
    const categoryQ = req.query.category;
    const offerQ = req.query.offer;

    const category = await Category.findById(categoryQ);
    const offers = await Offer.find({ _id: offerQ });
    console.log(categoryQ);
    console.log(offerQ);

    if (category && offers) {
      const offer = offers[0];
      console.log(offer, "entered");
      const offerPercentage = offer.percentage;
      const productsInCategory = await Product.find({ category: category._id });
      console.log(productsInCategory, "products inc ");
      await Category.findByIdAndUpdate(categoryQ, { $unset: { offer: "" } });
      const updatedProductsInCategory = await Product.find({
        category: category._id,
      });

      for (const product of updatedProductsInCategory) {
        const originalPrice = product.discount;
        console.log(`product name${product.name}and${product.discount}`);
        await Product.updateOne(
          { _id: product._id },
          {
            $inc: {
              price: originalPrice,
            },
          },
          {
            $unset: { discount: 1 },
          }
        );
      }
    } else {
    }
    res.redirect("/admin/category");
  } catch (error) {
    next(error);
  }
};

const unlist = async (req, res, next) => {
  try {
    const id = req.query.id;
    const category = await Category.findById(id);
    if (category) {
      const newStatus = !category.isListed;
      await Category.updateOne({ _id: id }, { isListed: newStatus });
    }
    res.redirect("/admin/category");
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    req.session.destroy();
    res.redirect("/admin");
  } catch (error) {
    next(error);
  }
};

const editcat = async (req, res, next) => {
  try {
    const id = req.query.id;
    const category = await Category.findById(id).populate("offer");
    const offers = await Offer.find({});
    const selectedOffer = offers.find((offer) =>
      offer._id.equals(category.offerName)
    );
    res.render("editcategory", {
      category: category,
      offers: offers,
      selectedOffer: selectedOffer,
    });
  } catch (error) {
    next(error);
  }
};

const downloadExcel = async (req, res, next) => {
  try {
  } catch (error) {
    next(error);
  }
};

module.exports = {
  loadDashboard,
  loadLogin,
  verifyLogin,
  viewUsers,
  blockUser,
  viewCategory,
  addCategory,
  unlist,
  editCategory,
  addOfferCategory,
  logout,
  editcat,
  cancelOffer,
};
