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
        res.render('admin_users', {users});
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
    
})

router.get('/users/ban/:username/:days',async(req,res) => {
    try {
        let today = new Date();
        let future_date = new Date(today.getTime() + (req.params.days * 24 * 60 * 60 * 1000));
        let unixtimestamp_banned_until = parseInt(future_date.getTime() / 1000);
        let users = (await pool.query(`UPDATE accounts
        SET banneduntil = $1
        WHERE username = $2
        RETURNING username, email, verified, banneduntil`,[unixtimestamp_banned_until, req.params.username])).rows;
        
        res.redirect('/admin/users');
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
    
})

router.get('/meetings',(req,res) => {
    res.render('admin_meetings');
 })
 
 
 
 







module.exports=router;