const express = require("express");
const router = express.Router();
const multer = require('multer');

const adminController = require("../controllers/Admin.controller");
const employeeeController = require("../controllers/employee.controller");
const attendenceController = require("../controllers/attendance.controller");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/attendence/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const registrationStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/registration/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

const registrationUpload = multer({ storage: registrationStorage });

router.post('/register',adminController.register);
router.post('/login',adminController.login);
router.post('/registerEmployee',registrationUpload.single('image'),employeeeController.register);
router.post('/verifyEmployeeId',employeeeController.verifyEmployeeId)
router.post('/attendance',upload.single('image'),attendenceController.submitAttendance);

module.exports = router