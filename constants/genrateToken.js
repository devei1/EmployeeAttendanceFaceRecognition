const jwt = require('jsonwebtoken');
const config = require("./config");

function genrateJwt(data){
    return jwt.sign(data,config.TOKEN_SECRET,{expiresIn:config.expires});
};

function verifyJwt(token){
    return jwt.verify(token,config.TOKEN_SECRET,(err,decoded)=>{
        if(err){
            console.error("JWT verification Failed", err.message);
            return;
        }
        console.log('JWT Verified');
        return decoded
    })
};

module.exports = {
    genrateJwt,
    verifyJwt
};