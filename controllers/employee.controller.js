const employeeUser = require("../models/employee.model");
const bcrypt = require("../constants/bycrpt");
const config = require("../constants/config");
const JWT = require("../constants/genrateToken")
const jsonToken = require('jsonwebtoken');
const fs = require('fs');


exports.register = async (req,res) => {
    try{
        const { name, employeeId, designation, email, password } = req.body;
        const image  = req.file;    
        const employee = await employeeUser.findOne({ employeeId });
        if (employee) {
            if (req.file) {
                fs.unlinkSync(req.file.path);
            }
            return res.status(config.STATUS.BAD_REQUEST).json({ error: 'Employee already exist' });
        }
        if(name && employeeId && designation && email && password && image){      
            const hashedPassword = await bcrypt.bcryptPassword(password);
            const newUser = new employeeUser({
                name,
                employeeId,
                designation,
                email,
                password:hashedPassword,
                status:true,
                isLoggedIn:false,
                imageFilename: image.filename
            });
            const savedUser = await newUser.save();
            return res.status(config.STATUS.CREATED).json({ message:"User registered successfully"})
        }else{
            if (req.file) {
                fs.unlinkSync(req.file.path);
            }
            return res.status(config.STATUS.BAD_REQUEST).json({errorMessage:"All feilds are required"});
        }
    }catch(error){
        console.error("Error registering user:",error.message);
        if (req.file) {
            fs.unlinkSync(req.file.path);
        }
        return res.status(config.STATUS.INTERNAL_SERVER_ERROR).json({ error: "Internal server error"})
    }
}

exports.verifyEmployeeId = async (req,res) => {
    try{
        const { employeeId } = req.body;
        if(employeeId){
            const employee = await employeeUser.findOne({ employeeId });
            if (!employee) {
                return res.status(config.STATUS.NOT_FOUND).json({ error: 'Employee not found' });
            };
            return res.status(config.STATUS.OK).json({message:'EmployeeId is correct'});
        }else{
            return res.status(config.STATUS.BAD_REQUEST).json({errorMessage:"EmployeeId is required"});
        }      
        }catch(error){
        console.log("Error",error.message);
        return res.status(config.STATUS.INTERNAL_SERVER_ERROR).json({error:'Internal Server Error'})
    }
}