const bcrypt = require("bcrypt");
const config = require("./config")

exports.bcryptPassword = async(password)=>{
    try{
        const salt = bcrypt.genSaltSync(config.saltRounds);
        const hash = bcrypt.hashSync(password, salt);
        return hash;
    }catch(err){
        return err.message
    }
}

exports.verifybcryptPassword = async(password,hashValue)=>{
    try{
        return bcrypt.compareSync(password, hashValue);        
    }catch(err){
        return "Password does not match"+err.message
    }
} 