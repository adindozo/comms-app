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


router.get('/',async(req,res) => {
    let code = req.query.code;
    if(code.length!=8 || (!/^\d+$/.test(code))) return res.sendStatus(406);
    let meeting = (await(pool.query('select * from meetings where code=$1',[code]))).rows[0];
    if(!meeting) return res.render('no-meeting',{code, error: 'Unfortunately, there is no such event active right now.'})
    let hostacc = (await(pool.query('select * from accounts where accountid=$1',[meeting.accountid]))).rows[0];
    if(isDateInPast(meeting.unixend)) return res.render('no-meeting',{code, error: 'Unfortunately, meeting '+ meeting.name + ', hosted by '+hostacc.username+', is no longer active.'});
    if(!isDateInPast(meeting.unixstart)) return res.render('no-meeting',{code, error: 'Meeting '+ meeting.name + ', hosted by '+hostacc.username+', will be available at '+formatDate(meeting.unixstart)+'.'});
    //after this line is code for available meeting
    res.render('meeting-socket',{code});

})









module.exports=router;