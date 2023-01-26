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




router.get('/', (req, res) => {
    res.render('login');
})






router.post('/', async (req, res) => {

    try {
        let email = req.body.email;
        let pw = req.body.password;
        //find user with req email and compare it's password with provided one
        let user = await pool.query('select * from accounts where email=$1', [email]);
        if (user.rowCount == 0) return res.render('login', { error: 'There is no account associated with that email address.' ,email,pw});
        
        let hashpw = user.rows[0].hashpw;
        let verified = user.rows[0].verified;
       //hashpw and verified values are required to authenticate user
       
        let password_is_valid = await bcrypt.compare(pw, hashpw);
        if (!password_is_valid) return res.render('login', { error: 'You have entered an incorrect password.' ,email,pw});
        if (!verified) return res.render('login', { error: 'Please verify your email before logging in.' ,email,pw});
        //todo check if user is banned
        let is_banned = Boolean(user.rows[0].banneduntil);
        if (is_banned) {

            //check if ban has expired
            if (!isDateInPast(user.rows[0].banneduntil)) {
                return res.render('login', { error: 'You are banned until ' + formatDate(user.rows[0].banneduntil),email,pw });
            }


        }
        //from this line is code for successful login
        let user_object = user.rows[0];
        delete user_object.hashpw; //do not store useless info in cookies
        delete user_object.emailcode;
        delete user_object.verified;
        delete user_object.resetpwcode;
        //cookie_token is a secret string for each user which, if they are logged in, has to be provided with each http request.
        let cookie_token = jwt.sign(user_object, process.env.jwt_token_secret);
        if (req.body.remember) { // if user wants server to remember credentials

            // Set the cookie to expire in one year
            let expirationDate = new Date();
            expirationDate.setFullYear(expirationDate.getFullYear() + 1);

            //res.setHeader('Set-Cookie', ['session_token=' + cookie_token + ';' + 'expires=' + expirationDate.toUTCString() + ';']);
            res.cookie('session_token', cookie_token, {
                maxAge: 31536000000, // expires in 1y
                httpOnly: true
            });
            res.redirect('/mymeetings');
            return;
        }
        res.cookie('session_token', cookie_token, {
            httpOnly: true
        });

        //res.setHeader('Set-Cookie', ['session_token=' + cookie_token]);
        res.redirect('/mymeetings');
    } catch (error) {
        console.log(error)
    }
})







module.exports=router;