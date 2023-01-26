const bcrypt = require('bcrypt');
const generator = require('generate-password');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
let path = require('path');
const pg = require('pg');
const express = require('express');
let cookies = require("cookie-parser");
const { formatDate, isDateInPast, checkPassword, checkEmail, checkUsername } = require('../../public/functions');
let dbconfig = { //database credentials stored in object
    user: process.env.user,
    database: process.env.database,
    password: process.env.password,
    host: process.env.host,
    port: parseInt(process.env.port)
}
const pool = new pg.Pool(dbconfig); //creating db pool
const router = express.Router();







router.post('/', async (req, res) => {
    try {

        let pw = req.body.password;
        let username = req.body.username;
        let email = req.body.email;
        if (!checkPassword(pw)) throw 'client-err';
        if (!checkUsername(username)) throw 'client-err';
        if (!checkEmail(email)) throw 'client-err';


        //check if email and username are unique


        let email_is_unique = (await pool.query('select email from accounts where email=$1', [email])).rowCount == 0;
        let username_is_unique = (await pool.query('select username from accounts where username=$1', [username])).rowCount == 0;

        if (!email_is_unique) return res.render('register', { error: 'Email already used for other account.', email, pw, username })

        if (!username_is_unique) return res.render('register', { error: 'Username already taken.', email, pw, username })


        //if all good, insert into DB unverified user

        let hashpw = await bcrypt.hash(pw, 10);

        //generate 16-char len email code
        const code = generator.generate({
            length: 16,
            numbers: true
        });

        await pool.query(`insert into accounts (username, hashpw, email, emailcode, verified)  
        values ($1,$2,$3,$4,false)`, [username, hashpw, email, code]);

        //send mail with code for verification, for optimization send to user that mail is already sent
        res.render('verify-email', { email });
        let transporter = nodemailer.createTransport({

            service: 'Outlook',

            auth: {
                user: process.env.email,
                pass: process.env.email_pw
            }
        });
        let link = 'http://' + req.headers.host + '/verify/' + code + '/' + username

        let mailOptions = {
            from: process.env.email,
            to: email,
            subject: 'Comms account verification',
            text: `Dear ${username},

Thank you for registering on Comms! We're excited to have you on board.
            
To complete your registration and start using our app, please verify your email by clicking the link below:
            
${link}
            
            
If you did not register for an account, please ignore this email.
            
Thank you,
Comms`
        };

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) console.log(error);

        });


    } catch (error) {
        //register data verification and error handling is done on client-side, 
        //if user disables JS verification and enters invalid data, 
        //'not acceptable' code will be sent  
        if (error == 'client-err') return res.sendStatus(406);
        res.sendStatus(500); //500 otherwise
        console.log(error);
    }

})

router.get('/', (req, res) => {
    res.render('register');
})

module.exports = router;

