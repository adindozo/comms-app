const bcrypt = require('bcrypt');
const generator = require('generate-password');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
let path = require('path');
const pg = require('pg');
const express = require('express');
let cookies = require("cookie-parser");
const { formatDate, isDateInPast, checkPassword, checkEmail, checkUsername } = require('./../public/functions');
let dbconfig = { //database credentials stored in object
    user: process.env.user,
    database: process.env.database,
    password: process.env.password,
    host: process.env.host,
    port: parseInt(process.env.port)
}
const pool = new pg.Pool(dbconfig); //creating db pool
const router = express.Router();


router.get('/:code',(req,res) => {
    let email = req.query.email;
    let code = req.params.code;
    try {
        let transporter = nodemailer.createTransport({

            service: 'Outlook',
    
            auth: {
                user: process.env.email,
                pass: process.env.email_pw
            }
        });
    
        let text = `We are writing to invite you to a ${req.user.username}'meeting. The meeting code is
            
${code}
            
and can be used to access the meeting via our website.

We look forward to seeing you at the meeting.
            
Best regards,
Comms`;

        let mailOptions = {
            from: process.env.email,
            to: email,
            subject: 'Comms meeting invitation',
            text: text
        };
    
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
                return res.sendStatus(500);
            } 
            res.sendStatus(200);
         
        });
    } catch (error) {
        res.sendStatus(500);
        console.log(error);
    }
  
})









module.exports=router;