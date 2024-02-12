const adminUser = require("../models/admin.model");
const bcrypt = require("../constants/bycrpt");
const config = require("../constants/config");
const JWT = require("../constants/genrateToken")
const jsonToken = require('jsonwebtoken');


exports.register = async (req,res) => {
    try{
        const { name, userName, email, password } = req.body;
        if(name && userName && email && password){      
            const hashedPassword = await bcrypt.bcryptPassword(password);
            const newUser = new adminUser({
                name,
                userName,
                email,
                password:hashedPassword,
                isLoggedIn:false
            });
            const savedUser = await newUser.save();
            return res.status(config.STATUS.CREATED).json({ message:"User registered successfully"})
        }else{
            return res.status(config.STATUS.BAD_REQUEST).json({errorMessage:"All feilds are required"});
        }
    }catch(error){
        console.error("Error registering user:",error.message);
        return res.status(config.STATUS.INTERNAL_SERVER_ERROR).json({ error: "Internal server error"})
    }
}

exports.login = async (req,res) => {
    try{
        const { userName, password } = req.body;
        if(userName && password){
            const user = await adminUser.findOne({ userName });
            if (!user) {
                return res.status(config.STATUS.NOT_FOUND).json({ error: 'User not found' });
            };
            const passwordMatch = await bcrypt.verifybcryptPassword(password,user.password);
            if (!passwordMatch) {
                return res.status(config.STATUS.UNAUTHORIZED).json({ error: 'Invalid password' });
            }
            await adminUser.findByIdAndUpdate(user._id,{isLoggedIn:true})
            const token = JWT.genrateJwt({_id:user._id, userName:user.userName, email:user.email});
            return res.status(config.STATUS.OK).json({message:'Login successful',token});
        }else{
            return res.status(config.STATUS.BAD_REQUEST).json({errorMessage:"All feilds are required"});
        }      
        }catch(error){
        console.log("Error",error.message);
        return res.status(config.STATUS.INTERNAL_SERVER_ERROR).json({error:'Internal Server Error'})
    }
}


exports.logout = async (req,res) => {
    try{
        const token = req.headers.authorization
        const decodedToken = jsonToken.verify(token, config.TOKEN_SECRET);
        
        await adminUser.findByIdAndUpdate(decodedToken._id,{isLoggedIn:false});
        return res.status(config.STATUS.OK).json({message:'Logout successful'});
    }catch(error){
        console.log("Error",error.message);
        return res.status(config.STATUS.INTERNAL_SERVER_ERROR).json({error:'Internal Server Error'})
    }
}