const express = require('express');
const app = express();
const bodyParser = require('body-parser')


const helmet = require("helmet");
const cors = require("cors");
const dotenv = require("dotenv").config();
const PORT = process.env.PORT;  
const db = require("./constants/db");
const noAuthRoutes = require("./routes/noAuthRoutes")
const routes = require("./routes/routes");
const auth = require("./middleware/Auth")



const http = require("http").Server(app);

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());
app.use('/api/Auth',auth)
app.use('/api/noAuth',noAuthRoutes);
app.use('/api/Auth',routes)

// global._path = __dirname;

// const OS = require("os");
// const path = require("path");
// const userName= OS.userInfo().username;
const _path = __dirname;  // "/home/"+userName+"/uploads"
global.modelURL =_path;

// async function LoadModels() {
//     // Load the models
//     // __dirname gives the root directory of the server
//     await faceapi.nets.faceRecognitionNet.loadFromDisk(__dirname + "/weights");
//     await faceapi.nets.faceLandmark68Net.loadFromDisk(__dirname + "/weights");
//     await faceapi.nets.ssdMobilenetv1.loadFromDisk(__dirname + "/weights");
// }
  
// LoadModels();


app.get("/", (req, res) => {
    res.send("Hello World!");
});

http.listen(PORT,()=>{
    console.log(`Severe running at ${PORT} `);
})

// let faceapi = require("face-api.js");
// let { Canvas, Image } = require("canvas");
// const canvas = require("canvas");


// faceapi.env.monkeyPatch({ Canvas, Image });


exports.modelURL = global.modelURL;
// exports.faceapi = faceapi;
// exports.canvas = canvas;
// exports.cnva = { Canvas, Image };