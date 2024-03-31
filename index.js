const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();
require("dotenv").config();

app.use(bodyParser.json());
app.use(cors({
    origin : "*"
}))
app.use(session({
    secret : "akhcvkjlyhenfsd",
    resave:false,
    saveUninitialized:false,
}))

app.get("/",async(req,res)=>{
    return res.json({message : "api endpoint running!"})
})

app.listen(8000 || process.env.PORT, ()=>{
    console.log(`server is running on ${PORT}`);
})