const {Queue} = require("bullmq");
const { google } = require("googleapis");
require('dotenv').config();
const OpenAI = require("openai");
const { createConfig } = require("../helpers/utils");
const { default: axios } = require("axios");
const nodemailer = require('nodemailer');

const producer = require("../producer")

const sendMailQueue = new Queue("email-queue",{
    connection : {
        host : "localhost",
        port : 6379
    }
})

async function init(body){

    try {
      const res = await sendMailQueue.add("Email to the selected User",{
        from : body.from,
        to : body.to,
        id  : body.id
      },{removeOnComplete : true});
      console.log("Job added to queue",res.id);  
        
    } catch (error) {
        console.log(error);
        throw error;
    }
}

const oAuth2Client = new google.auth.OAuth2({
    clientId : process.env.GOOGLE_CLIENT_ID,
    clientSecret : process.env.GOOGLE_SECRETKEY,
    redirectUri : process.env.GOOGLE_REDIRECT_URL
})

oAuth2Client.setCredentials({refresh_token : process.env.GOOGLE_TOKEN})

const openai = new OpenAI({apiKey : process.env.OPENAI_SECRET_KEY})

const getUser = async (req,res) =>{
    try {
        const url = `https://gmail.googleapis.com/gmail/v1/users/${req.params.email}/profile`
        const {token } = await oAuth2Client.getAccessToken();
        if (!token){ return res.send("Token not found, Please login first")}
        const config = createConfig(url,token);
        const response = await axios(config);
        res.json(response.data);

    } catch (error) {
        console.log(error);
        res.send(error);
    }
}

const readMail = async (req, res) => {
    try {
        const url = `https://gmail.googleapis.com/gmail/v1/users/${req.params.email}/messages/${req.params.message}`;
        const { token } = await oAuth2Client.getAccessToken();
        if (!token) { return res.send("Token not found, Please login again to get token"); }
        const config = createConfig(url, token);
        const response = await axios(config);
        res.json(response.data);
    } catch (error) {
        console.error(error);
        res.send(error);
    }
};

const sendMail = async (data) => {
    try {
       console.log(data);
       const {token} = await oAuth2Client.getAccessToken();
       if(!token) {throw new Error("Token not found,Pls login again")}
        const transport = nodemailer.createTransport({
            service : "gmail",
            auth : {
                ...producer.auth,
                accessToken : token
            },
            tls : {
                rejectUnauthorized : false
            }
        });

        const mailOptions = {
            from : "vipulgirhestar@gmail.com",
            to : "adityagirhe@gmail.com",
            subject : "message from gmail using NodeJS",
            text : "hello"
        };
        mailOptions.from = data.from;
        mailOptions.to = data.to;

        let response;
        if (data.label === 'Interested' || data.label === 'Not Interested' || data.label === 'More information') {
            const response = await openai.chat.completions.create({
                model: "text-davinci-003",
                max_token : 120, //long response
                temperature : 0, //more risk model takes
                frequency_penalty: 0.5, // not repeat similar sentence
                presence_penalty: 0,
                messages : [{
                    role : "user", content: `Write a small text based on the request in around 50 - 80 words`
                }],
            });
            mailOptions.subject = `User is : ${data.lable}`,
            mailOptions.text = `${response.choices[0].message.content}`;
            response = await transport.sendMail(mailOptions)
            res.status(200).send({
                bot: response.data.choices[0].text
            });
        }
        return response;
  
    } catch (error) {
        console.log(error);
        throw error;
    }
}