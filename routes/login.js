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




router.get('/', (req, res) => {
    res.render('login');
})






router.post('/', async (req, res) => {

    try {
        let email = req.body.email;
        let pw = req.body.password;
        //find user with req email and compare it's password with provided one
        let user = await pool.query('select hashpw, verified, banneduntil from accounts where email=$1', [email]);
        if (user.rowCount == 0) return res.render('login', { error: 'there is not an acc with that email' });
        let hashpw = user.rows[0].hashpw;
        let verified = user.rows[0].verified;

        let password_is_valid = await bcrypt.compare(pw, hashpw);
        if (!password_is_valid) return res.render('login', { error: 'wrong password. Forgot password?' });
        if (!verified) return res.render('login', { error: 'Please verify your email before logging in.' });
        //todo check if user is banned
        let is_banned = Boolean(user.rows[0].banneduntil);
        if (is_banned) {

            //check if ban has expired
            if (!isDateInPast(user.rows[0].banneduntil)) {
                return res.render('login', { error: 'You are banned until ' + formatDate(user.rows[0].banneduntil) });
            }


        }
        //from this line is code for successful login
        const user_object = {
            email: email,
            banneduntil: user.rows[0].banneduntil
        }
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
            res.sendStatus(200);
            return;
        }
        res.cookie('session_token', cookie_token, {
            httpOnly: true
        });

        //res.setHeader('Set-Cookie', ['session_token=' + cookie_token]);
        res.sendStatus(200);
    } catch (error) {
        console.log(error)
    }
})







module.exports=router;