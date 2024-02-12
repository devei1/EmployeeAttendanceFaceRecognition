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


app.get("/", (req, res) => {
    res.send("Hello World!");
});

http.listen(PORT,()=>{
    console.log(`Severe running at ${PORT} `);
})