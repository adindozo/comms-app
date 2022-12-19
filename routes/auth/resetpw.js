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

router.get('/', (req, res) => { //1. user clicks reset password button
    res.render('resetpw');
})

router.post('/', async (req, res) => { //2. user sends email associated with his acc
    
    try {
        let email = req.body.email;
        //generate 9-char len email code
        const code = generator.generate({
            length: 9,
            numbers: true,
            uppercase: false,
            lowercase: false
        });
        res.render('resetpwinput',{email}); //3. code sent to mail

        await pool.query(`update accounts set resetpwcode=$1 where  
        email=$2`, [code, email])

        let transporter = nodemailer.createTransport({

            service: 'Outlook',

            auth: {
                user: process.env.email,
                pass: process.env.email_pw
            }
        });

        let mailOptions = {
            from: process.env.email,
            to: email,
            subject: 'Comms account password reset',
            text: 'Your code is ' + code
        };

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) console.log(error);

        });

    } catch (error) {
        console.log(error)
        res.sendStatus(500);
    }

})




router.post('/codesent', async (req, res) => { //4. user enters code and new password
    let pw = req.body.password;
    let code = req.body.code;
    try {
        let count = (await pool.query(`select email from accounts where resetpwcode=
        $1`, [code])).rowCount;

        if (count == 0) return res.render('resetpwinput',{error: 'wrong code', email: req.body.email});
        if (!checkPassword(pw)) return res.render('resetpwinput',{error: 'Invalid password', email: req.body.email});
        let hashpw = await bcrypt.hash(pw, 10);
        await pool.query(`update accounts set hashpw=$1 where  
        resetpwcode=$2`, [hashpw, code]);
        await pool.query(`update accounts set resetpwcode=null where  
        resetpwcode=$1`, [code]);
        res.send('password changed');
    } catch (error) {
        res.sendStatus(500);
        console.log(error);
    }

})














module.exports = router;