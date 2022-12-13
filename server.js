// TODO
//     1.Create accounts databse ✔️
//          [acc types: admin, user, guest] 
//          user can be banned

//     2. Create register and login user system, store hashed passwords in database ✔️
//            register route
//     3. auth middleware     ✔️
//     4. split router functionalities into external files     ✔️
// 
require('dotenv').config(); //database credentials stored in .env
const bcrypt = require('bcrypt');
const generator = require('generate-password');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
let path = require('path');
const pg = require('pg');
const express = require('express');
let cookies = require("cookie-parser");
const { formatDate, isDateInPast, checkPassword, checkEmail, checkUsername } = require('./public/functions');
const app = express();
const port = 8080;


let dbconfig = { //database credentials stored in object
    user: process.env.user,
    database: process.env.database,
    password: process.env.password,
    host: process.env.host,
    port: parseInt(process.env.port)
}




app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: false }));
app.use(cookies());


const pool = new pg.Pool(dbconfig); //creating db pool




const registerRouter = require('./routes/register');
app.use('/register', registerRouter);

const verifyRouter = require('./routes/verify');
app.use('/verify', verifyRouter);

const loginRouter = require('./routes/login');
app.use('/login', loginRouter);

const logoutRouter = require('./routes/logout');
app.use('/logout', logoutRouter);


const resetpwRouter = require('./routes/resetpw');
app.use('/resetpassword', resetpwRouter);


let auth_middleware = function (req, res, next) {
    let jwt_token = req.cookies.session_token
    if (!jwt_token) return res.redirect('/login'); //if auth cookie is absent
    jwt.verify(jwt_token, process.env.jwt_token_secret, (err, user) => {
        req.email=user.email; //attach user email to req object
        if (err) return res.redirect('/logout'); //if auth cookie is invalid
        if (!user.banneduntil) return next(); //if user is not banned, proceed
        if (isDateInPast(user.banneduntil)) return next(); //if ban expired, proceed
        res.redirect('/logout')
    });
}

//all requests after this line will use the auth middleware, user info is in req obj
app.get('/authTEST', (req, res) => {
    res.sendStatus(200);
})




app.listen(port, () => console.log(`app listening on port ${port}`));