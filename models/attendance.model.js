const mongoose = require("mongoose");

const employeeAttendanceSchema = new mongoose.Schema({
    employeeId:{
        type:String,
        required:true,
    },
    date: {
        type: Date,
        required: true,
        default: Date.now
    },
    ipAddress:{
        type:String
    },
    status: {
        type: String,
        enum: ['Present', 'Absent', 'Leave'],
        default: 'Absent'
    },
    imageFilename: {
        type: String
    }
}, { timestamps: true });

module.exports = mongoose.model("employeeAttendance",employeeAttendanceSchema);