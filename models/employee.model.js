const mongoose = require("mongoose");

const employeeUserSchema = new mongoose.Schema({
    name:{
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
    employeeId:{
        type:String,
        required:true,
    },
    designation:{
        type:String,
        required:true
    },
    status:{
        type:Boolean,
        default:true
    },
    isLoggedIn:{
        type:Boolean,
        default:false
    },
    imageFilename: {
        type: String
    }
},{timestamps:true});

module.exports = mongoose.model("employeeUser",employeeUserSchema);