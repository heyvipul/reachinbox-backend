import { tryCatch } from 'bullmq';
import session from 'express-session';

const { google } = require('googleapis');
require("dotenv").config

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const CLIENT_SECRET_KEY = process.env.GOOGLE_SECRETKEY
const REDIRECT_URL = "http://localhost:8000/"
const SCOPES = ['https://mail.google.com/'];

const oauthClient = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET_KEY,
    REDIRECT_URL
)
export const signInGoogle = async (req,res) => {
    try {
        const authUrl = oauthClient.generateAuthUrl({
            access_type :"offline",
            scope : SCOPES
        })
        res.redirect(authUrl)
        
    } catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Down")
    }
}

//handle authorization
export const handleAuthorization = async (req,res) =>{
    try {
        const code = req.query
        const {tokens} = await oauthClient.getToken(code);
        oauthClient.setCredentials(tokens);
        req.session.accessToken = tokens.access_token;
        res.redirect("/get-emails")
   
    } catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Down")
    }
}

//get emails
export const getEmails = async (req,res) =>{
    try {
        const accessToken = req.session.accessToken;
        if(!accessToken){
            return res.status(401).send("User not authenticated. Please sign in first")
        }
        const gmail = google.gmail({version : "v1",auth :oauthClient})
        const response = await gmail.users.messages.list({userId : "me"})
        res.send(response.data)
        
    } catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Down")
    }
}

export const getAccessTokenFromGoogle = (req, res) => {};
export const getUserFromGoogle = (req, res) => {};

module.exports = {
    signInGoogle,
    handleAuthorization,
    getEmails,
    getAccessTokenFromGoogle,
    getUserFromGoogle
}