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


router.get('/:code/:username', async (req, res) => {
    try {
        let code = req.params.code;
        let username = req.params.username;
        let count = (await pool.query(`select username from accounts where emailcode=
        $1 and username=$2`, [code, username])).rowCount;
        if (count == 0) return res.sendStatus(404);
        await pool.query(`update accounts set verified=true, emailcode=null where  
        username=$1`, [username]);
        res.render('verified', { username });
    } catch (error) {
        console.log(error)
        res.sendStatus(500);
    }

})









module.exports=router;