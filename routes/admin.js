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


router.get('/users',async(req,res) => {
    try {
        let users = (await pool.query('select username, email, verified, banneduntil from accounts')).rows;
        res.render('admin_users', users);
        console.log(users);
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
    
})

router.get('/meetings',(req,res) => {
    res.render('admin_meetings');
 })
 
 
 
 







module.exports=router;