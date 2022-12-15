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
    res.render('mymeetings',{username: req.user.username});
})

//API for retrieving list of meetings in JSON

router.get('/meeting_list_json', async (req, res) => {
    let meetings = await pool.query('select * from meetings where accountID=$1',[req.user.accountid]);
    res.json(meetings.rows);
})

//API for adding meeting

router.post('/add_meeting', async (req, res) => {
    
})








module.exports=router;