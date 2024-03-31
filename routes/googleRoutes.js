const express = require("express");
const app = express();
const googleRouter = express.Router();
const {handleAuthorization,
    getEmails,signInGoogle,
    getAccessTokenFromGoogle} = require("../controllers/googleController")

app.use(express.json());
app.use(express.urlencoded({extended:true}));

googleRouter.get("/signin",signInGoogle);
googleRouter.get("/",handleAuthorization)
googleRouter.get("/get-access-token",getAccessTokenFromGoogle)
googleRouter.get("/get-mails/",getEmails)

module.exports = {googleRouter}