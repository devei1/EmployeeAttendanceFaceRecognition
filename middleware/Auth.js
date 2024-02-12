const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const config = require("../constants/config");

router.use((req,res,next)=>{
    const token = req.headers.authorization;

    if (token == null) return res.sendStatus(config.STATUS.UNAUTHORIZED);  
    jwt.verify(token,config.TOKEN_SECRET,(err,user)=>{
        if(err) return res.sendStatus(config.STATUS.UNAUTHORIZED);
        user = user
        next();
    })
})

module.exports = router;