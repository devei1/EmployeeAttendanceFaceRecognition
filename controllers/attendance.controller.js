// const EmployeeAttendance = require("../models/attendance.model");
// const employeeUser = require("../models/employee.model");
// const config = require("../constants/config");
// const fs = require('fs');

// exports.submitAttendance = async (req, res) => {
//     try {
//         const { employeeId, status } = req.body;
//         const image  = req.file;
//         const ipAddress = req.ip;
//         if(employeeId && status && image && ipAddress){
//             const employee = await employeeUser.findOne({ employeeId });
//             console.log(employee);
//             const image1 = employee.imageFilename;
//             if (!employee) {
//                 if (req.file) {
//                     fs.unlinkSync(req.file.path);
//                 }
//                 return res.status(config.STATUS.NOT_FOUND).json({ error: 'Employee not found' });
//             }else{
//                 const attendance = new EmployeeAttendance({
//                     employeeId,
//                     status,
//                     ipAddress,
//                     imageFilename: image.filename
//                 });

//                 await attendance.save();
//                 return res.status(config.STATUS.CREATED).json({ message: 'Attendance submitted successfully', attendance });
//             }
//         }else{
//             if (req.file) {
//                 fs.unlinkSync(req.file.path);
//             }
//             return res.status(config.STATUS.BAD_REQUEST).json({errorMessage:"All feilds are required"});
//         }
//     } catch (error) {
//         console.error('Error submitting attendance:', error.message);
//         if (req.file) {
//             fs.unlinkSync(req.file.path);
//         }
//         return res.status(config.STATUS.INTERNAL_SERVER_ERROR).json({ error: 'Internal Server Error' });
//     }
// };

















// const tf = require('@tensorflow/tfjs-node');
const EmployeeAttendance = require("../models/attendance.model");
const employeeUser = require("../models/employee.model");
const config = require("../constants/config");
const faceapi = require('face-api.js');
const { Canvas, Image, ImageData } = require('canvas');
const fs = require('fs');


// Load Face-API.js models
async function loadModels() {
    await faceapi.nets.faceRecognitionNet.loadFromDisk('./weights');
    await faceapi.nets.faceLandmark68Net.loadFromDisk('./weights');
    await faceapi.nets.ssdMobilenetv1.loadFromDisk('./weights');
}

// Load images and convert them to tensors
async function loadImage(imagePath) {
    const img = await fs.promises.readFile(imagePath);
    const buffer = Buffer.from(img);
    const imgTensor = faceapi.tf.node.decodeImage(buffer);
    return imgTensor;
}

// Compare two images
async function compareImages(imagePath1, imagePath2) {
    const img1 = await loadImage(imagePath1);
    const img2 = await loadImage(imagePath2);

    const detections1 = await faceapi.detectAllFaces(img1).withFaceLandmarks().withFaceDescriptors();
    const detections2 = await faceapi.detectAllFaces(img2).withFaceLandmarks().withFaceDescriptors();

    const faceMatcher = new faceapi.FaceMatcher(detections1);
    const results = detections2.map(face => faceMatcher.findBestMatch(face.descriptor));

    return results;
}

exports.submitAttendance = async (req, res) => {
    try {
        const { employeeId, status } = req.body;
        // const image = req.file;
        const ipAddress = req.ip;
        // console.log("submitAttendance>>>>>>>>>>>>>>>",req.body, req.file, ipAddress);
        if (employeeId && status && ipAddress) {
            const employee = await employeeUser.findOne({ employeeId });
            console.log("employee: >>>>>>>>> ", employee != null ? 'employee data found' : employee);
            if(!employee){
                // if (req.file) {
                //     fs.unlinkSync(req.file.path);
                // }
                return res.status(config.STATUS.NOT_FOUND).json({ error: 'Employee not found' });
            }
            const attendance = new EmployeeAttendance({
                employeeId,
                status,
                ipAddress,
                // imageFilename: image.filename
            });

            // const image1Path = `C:\\Users\\Ei-04\\Desktop\\Admin-Login-Panel\\EmployeeAdminPanelBackend\\uploads\\registration\\${employee.imageFilename}`;
            // const image2Path = `C:\\Users\\Ei-04\\Desktop\\Admin-Login-Panel\\EmployeeAdminPanelBackend\\uploads\\attendence\\${attendance.imageFilename}`;

            // Load Face-API.js models
            // await loadModels();

            // Compare images
            // const results = await compareImages(image1Path, image2Path);
            // console.log(results);
            // if(results){   
                await attendance.save();
                res.status(config.STATUS.CREATED).json({ message: 'Attendance submitted successfully', attendance });
            // }else{
            //     if (req.file) {
            //         fs.unlinkSync(req.file.path);
            //     }
            //     return res.status(config.STATUS.BAD_REQUEST).json({ errorMessage: "Not the same person" });
            // }
        } else {
            // if (req.file) {
            //     fs.unlinkSync(req.file.path);
            // }
            return res.status(config.STATUS.BAD_REQUEST).json({ errorMessage: "All fields are required" });
        }
    } catch (error) {
        // if (req.file) {
        //     fs.unlinkSync(req.file.path);
        // }
        console.error('Error submitting attendance:', error.message);
        res.status(config.STATUS.INTERNAL_SERVER_ERROR).json({ error: 'Internal Server Error' });
    }
};
