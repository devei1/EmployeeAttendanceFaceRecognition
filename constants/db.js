const mongoose = require('mongoose');
const dotenv = require("dotenv").config();
const DB_URL = process.env.DB_URL_DEV;

mongoose.connect(DB_URL).then(()=>{
    console.log("Connected to database");
}).catch((error)=>{
    console.log(error);
    console.log("Connection Failed");
});