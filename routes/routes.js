const express = require("express");
const router = express.Router();

const adminController = require("../controllers/Admin.controller");

router.post('/logout',adminController.logout);
module.exports = router