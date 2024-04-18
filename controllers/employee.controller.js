const employeeUser = require("../models/employee.model");
const bcrypt = require("../constants/bycrpt");
const config = require("../constants/config");
const JWT = require("../constants/genrateToken")
const jsonToken = require('jsonwebtoken');
const fs = require('fs');
const path = require('path')

let faceapi = require("face-api.js");
let { Canvas, Image } = require("canvas");
let canvas = require("canvas");
faceapi.env.monkeyPatch({ Canvas, Image});



async function LoadModels() {
    // Load the models
    // __dirname gives the root directory of the server
    await faceapi.nets.faceRecognitionNet.loadFromDisk( "/home/hp-ubuntu/Desktop/EmployeeAdminPanelBackend/weights/");
    await faceapi.nets.faceLandmark68Net.loadFromDisk( "/home/hp-ubuntu/Desktop/EmployeeAdminPanelBackend/weights/");
    await faceapi.nets.ssdMobilenetv1.loadFromDisk( "/home/hp-ubuntu/Desktop/EmployeeAdminPanelBackend/weights/");
    // await faceapi.nets.ssdMobilenetv1.loadFromDisk( path.join(global._path + "/weights"));
}
  
// LoadModels();

// let faceapi = require('../server').faceapi;
// let cnva = require('../server').cnva; path.join(
    


// ReferenceError: Cannot access 'faceapi' before initialization
// let ss = require('../weights')



// async function LoadModels() {
//     // Load the models
//     // __dirname gives the root directory of the server
//     await faceapi.nets.faceRecognitionNet.loadFromDisk('../weights');
//     await faceapi.nets.faceLandmark68Net.loadFromDisk('../weights');
//     await faceapi.nets.ssdMobilenetv1.loadFromDisk('../weights');

//     // await faceapi.nets.faceRecognitionNet.loadFromDisk(__dirname + "/models");
//     // await faceapi.nets.faceLandmark68Net.loadFromDisk(__dirname + "/models");
//     // await faceapi.nets.ssdMobilenetv1.loadFromDisk(__dirname + "/models");
// }
//   LoadModels();

async function uploadLabeledImages(images, label) {
    try {
      let counter = 0;
      const descriptions = [];
      // console.log(`images`, images);
      // Loop through the images
      for (let i = 0; i < images.length; i++) {
        const img = await canvas.loadImage(images[i]);
        counter = (i / images.length) * 100;
        console.log(`Progress = ${counter}%`,img);
        // Read each face and save the face descriptions in the descriptions array
        const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();
        descriptions.push(detections.descriptor);
      }

          // Create a new face document with the given label and save it in DB
    //   const createFace = new FaceModel({
    //     label: label,
    //     descriptions: descriptions,
    //   });
    //   await createFace.save();

      console.log(`Progress = 100%`);
      console.log(">>>>>descriptions<<<<<<", descriptions.length)  
      return descriptions; //true;
    } catch (error) {
      console.log(error);
      return (error);
    }
  }


exports.register = async (req,res) => {
    try{
        const { name, employeeId, designation, email, password } = req.body;
        // const image  = req.file; 
        console.log("files ", req.files );
        await LoadModels();
        const images  = req.files;    
        const employee = await employeeUser.findOne({ employeeId });
        if (employee) {
            // if (req.file) {
            //     fs.unlinkSync(req.file.path);
            // }

            let tempd= req.files.map(({path, ...rest})=> path)
            // console.log("tempd ", tempd );
            let label = req.body.employeeId;
            let result = await uploadLabeledImages(tempd, label);
            // console.log("result ", result );
            employee.descriptions=result;
            employee.save();

            return res.status(config.STATUS.BAD_REQUEST).json({ error: 'Employee already exist' });
        }
        if(name && employeeId && designation && email && password && images){      

            let tempd= req.files.map(({path, ...rest})=> path)
            // console.log("tempd ", tempd );
            let label = req.body.employeeId;
            // await LoadModels();
            let result = await uploadLabeledImages(tempd, label);

            const hashedPassword = await bcrypt.bcryptPassword(password);
            const newUser = new employeeUser({
                name,
                employeeId,
                designation,
                email,
                password:hashedPassword,
                status:true,
                isLoggedIn:false,
                label: label,
                descriptions: result,

                // imageFilename: image.filename
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


async function getDescriptorsFromDB(image) {
    // Get all the face data from mongodb and loop through each of them to read the data
    // let faces = await FaceModel.find();
    const faces = await employeeUser.find({});
    for (i = 0; i < faces.length; i++) {
      // Change the face data descriptors from Objects to Float32Array type
      for (j = 0; j < faces[i].descriptions.length; j++) {
        faces[i].descriptions[j] = new Float32Array(Object.values(faces[i].descriptions[j]));
      }
      // Turn the DB face docs to
      faces[i] = new faceapi.LabeledFaceDescriptors(faces[i].label, faces[i].descriptions);
    }
    // Load face matcher to find the matching face
    const faceMatcher = new faceapi.FaceMatcher(faces, 0.6);
    // Read the image using canvas or other method
    const img = await canvas.loadImage(image);
    let temp = faceapi.createCanvasFromMedia(img);
    // Process the image for the model
    const displaySize = { width: img.width, height: img.height };
    faceapi.matchDimensions(temp, displaySize);
  
    // Find matching faces
    const detections = await faceapi.detectAllFaces(img).withFaceLandmarks().withFaceDescriptors();
    const resizedDetections = faceapi.resizeResults(detections, displaySize);
    const results = resizedDetections.map((d) => faceMatcher.findBestMatch(d.descriptor));
    // console.log("results>>>>>", results);
    return results;
  }


exports.isValidUser = async (req, res)=>{
try{
    // console.log("isValidUser>>>> ",req.body, req.file)
    const File1 = req.file.path;
    await LoadModels();
    let result = await getDescriptorsFromDB(File1);
   // res.json({ result });
   if(result[0] &&  result[0]?._label){
    let labelvar =  result[0]?._label;
    // console.log("labelvar", labelvar.toString(), (labelvar != 'unknown'));
    if(labelvar != 'unknown'){
      let user = await employeeUser.findOne({employeeId : labelvar.toString()}).exec();
        console.log("user: >>>>>>", user != null ? 'user data found' : user);
        if(user.employeeId){
          req.body.employeeId= user.employeeId;
          req.body.status = "Present";
        }
      let attendance = require('./attendance.controller');
      attendance.submitAttendance(req, res);
    } else res.status(404).send('Unknown User'); 
  }
}catch(err){
    console.log("err", err);

}

}