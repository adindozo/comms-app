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


router.get('/users',async(req,res) => { //show user table with ban options
    try {
        let users = (await pool.query('select username, email, verified, banneduntil from accounts')).rows;
        res.render('admin_users', {users, formatDate, isDateInPast});
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
    
})

router.get('/users/ban/:username/:days',async(req,res) => { //ban options
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

router.get('/meetings',async (req,res) => { //show meeting table
    try {
        let meetings = (await pool.query('select * from meetings')).rows;
        let hosts = (await pool.query('select accountid,username from accounts')).rows;
        meetings.forEach(meeting => {
            meeting.host_name = (hosts.find(account => account.accountid==meeting.accountid)).username;
        })
        res.render('admin_meetings',{meetings, formatDate});
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
   
 })

 router.get('/meetings/delete/:id',async (req,res) => {
    try {
        await pool.query('delete from meetings where meetingid=$1',[req.params.id]);
        res.redirect('/admin/meetings');
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
 })

 router.get('/forbidden_words', async (req,res) => {
    try {
        let words = (await pool.query('select * from forbidden_words')).rows;
        console.log(words);
        res.render('admin_forbidden_words',{words});
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
 })
 
 router.get('/forbidden_words/delete/:id', async (req,res) => {
    try {
        await pool.query('delete from forbidden_words where id=$1',[req.params.id]);
        res.redirect('/admin/forbidden_words');
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
 })
 
 router.get('/forbidden_words/add', async (req,res) => {
    try {
        let word = req.query.word.toLowerCase();
        await pool.query('INSERT INTO forbidden_words (word) VALUES ($1);',[word]);
        res.redirect('/admin/forbidden_words');
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
 })
 
 
 
 
 
 
 







module.exports=router;