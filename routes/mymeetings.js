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


//router.use(express.urlencoded({ extended: true }));



router.get('/', (req, res) => {
    res.render('mymeetings', { username: req.user.username });
})

//API for retrieving list of meetings in JSON

router.get('/meeting_list_json', async (req, res) => {
    let meetings = await pool.query('select * from meetings where accountID=$1', [req.user.accountid]);
    res.json(meetings.rows);
})

// Crud API for adding meeting

router.post('/add_meeting', async (req, res) => {
    return res.json(JSON.parse(req.body.cover).data) //req.body.cover.data is Base64 string-picture
    try {
        if ((await pool.query('select code from meetings where code = $1',[req.body.code])).rowCount!=0) return res.status(409).json({error: 'Code already used'});
        await pool.query(`insert into meetings 
            (name,code,accountid,unixstart,unixend,coverphoto) values
            ($1,$2,$3,$4,$5,$6)
            `, [req.body.name, req.body.code, req.user.accountid, req.body.unixstart, req.body.unixend, Boolean(req.body.coverphoto)]);
        if(!req.body.coverphoto) return res.sendStatus(200); //else store that photo in server with meetingID filename
        
        res.sendStatus(200);
        //add default pic
    } catch (error) {
        console.log(error)
        res.sendStatus(500);
    }

})








module.exports = router;