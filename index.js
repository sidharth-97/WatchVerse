require('dotenv').config()
const express = require('express');
const mongoose = require('mongoose');
const nocache = require('nocache');
const path = require('path');
const app = express();
app.use(nocache())

try {
mongoose.connect(process.env.MongoURL,console.log('database connected'));
    
} catch (error) {
    console.log(error.message);
}

app.use(express.static(path.join(__dirname, 'public')))
const userRoute = require('./routes/userRoute');
const adminRoute = require("./routes/adminRoute")

app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.set("view engine", "ejs");

app.use('/', userRoute);
app.use('/admin', adminRoute)

const errorHandler = (err, req, res, next) => {
    console.error(err);
    res.status(500).render('error', { message: 'Internal Server Error' });
  };
app.use(errorHandler);

app.use((req, res) => {
    res.status(404).render('error')
})

app.listen(3000, function () {
    console.log("Server running") 
});
