const mongoose = require("mongoose");
// const uniqueValidator = require("mongoose-unique-validator");

const adminUserSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    userName:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true,
        unique:true
    },
    isLoggedIn:{
        type:Boolean,
        default:false
    }
},{timestamps:true});

// adminUserSchema.plugin(uniqueValidator);
module.exports = mongoose.model("adminUser",adminUserSchema);
