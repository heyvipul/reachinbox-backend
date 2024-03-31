require("dotenv").config();

const auth = {
    type : "OAuth2",
    user : "vipulgirhestar@gmail.com",
    clientId : process.env.GOOGLE_CLIENT_ID,
    clientSecretKey : process.env.GOOGLE_SECRETKEY,
}

const mailOptions = {
    from  : "vipulgirhestar@gmail.com",
    to : "adityagirhe@gmail.com",
    subject : "Email from NodeJs"
}

module.exports = {auth,mailOptions}