const bcrypt = require('bcrypt');
const generator = require('generate-password');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
let path = require('path');
const pg = require('pg');
const express = require('express');
let cookies = require("cookie-parser");
const fs = require("fs");
const { formatDate, isDateInPast, checkPassword, checkEmail, checkUsername, datetimeLocalToTimestamp } = require('./../public/functions');
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
    res.render('mymeetings', { username: req.user.username, account_id: req.user.accountid });
})

//API for retrieving list of meetings in JSON

router.get('/meeting_list_json', async (req, res) => {
    let meetings = await pool.query('select * from meetings where accountID=$1', [req.user.accountid]);
    meetings.rows.sort((a,b)=>a.meetingid - b.meetingid);
    res.json(meetings.rows);
})

// crud API for meetings


//create
router.post('/add_meeting', async (req, res) => {
    
    

    //return res.json(JSON.parse(req.body.cover).data) //req.body.cover.data is Base64 string-picture
    let unixstart = datetimeLocalToTimestamp(req.body.unixstart)//change to unix timestamp in secs
    let unixend = datetimeLocalToTimestamp(req.body.unixend)//change to unix timestamp in secs

    if (unixstart > unixend) return res.sendStatus(406);
    if (isDateInPast(unixstart) || isDateInPast(unixend)) return res.sendStatus(406);
    if (!(req.body.name && unixend && unixstart)) return res.sendStatus(406);

    try {

        const code = generator.generate({
            length: 8,
            numbers: true,
            lowercase: false,
            uppercase: false
        });
        let id = (await pool.query(`insert into meetings 
            (name,code,accountid,unixstart,unixend,coverphoto) values
            ($1,$2,$3,$4,$5,$6) returning meetingid
            `, [req.body.name, code, req.user.accountid, unixstart, unixend, Boolean(req.body.cover)])).rows[0].meetingid;

        if (!req.body.cover) return res.sendStatus(201); //if photo is not uploaded, else store that photo in server with meetingID filename
        


        const content = req.body.cover;

        let coverimgBuffer = Buffer.from(req.body.cover, 'base64');

     
        fs.writeFile(__dirname + '/../public/meeting_pictures/' + id + '.jpeg', coverimgBuffer, (error) => {

            if (error) {
                console.log(error);
                return res.sendStatus(501);
            }
            res.sendStatus(201);

        })

        
    } catch (error) {
        console.log(error)
        res.sendStatus(501);
    }

})

//read
router.get('/json_list', async (req, res) => {
    try {
        res.json((await pool.query('select * from meetings')).rows);

    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
})

router.get('/json_list/:id', async (req, res) => {
    try {
        res.json((await pool.query('select * from meetings where meetingid=$1', [req.params.id])).rows);

    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
})


//delete
router.delete('/delete_meeting/:id', async (req, res) => {
    try {
        await pool.query('delete from meetings where meetingid=$1', [req.params.id]);
        res.sendStatus(200);

    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
})


//todo finish cRUD api


module.exports = router;