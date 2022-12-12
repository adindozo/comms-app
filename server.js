// TODO
//     1.Create accounts databse ✔️
//          [acc types: admin, user, guest] 
//          user can be banned

//     2. Create register and login user system, store hashed passwords in database ✔️
//            register route
//     3. auth middleware     
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
const router = express.Router();
const app = express();
const port = 8080;





app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: false }));
app.use(cookies());

let dbconfig = { //database credentials stored in object
    user: process.env.user,
    database: process.env.database,
    password: process.env.password,
    host: process.env.host,
    port: parseInt(process.env.port)
}

const pool = new pg.Pool(dbconfig); //creating db pool



app.get('/register', (req, res) => {

    res.render('register');

})

app.post('/register', async (req, res) => {


    try {



        let pw = req.body.password;
        let username = req.body.username;
        let email = req.body.email;
        if (!checkPassword(pw)) throw 'client-err';
        if (!checkUsername(username)) throw 'client-err';
        if (!checkEmail(email)) throw 'client-err';


        //check if email and username are unique


        let email_is_unique = (await pool.query('select email from accounts where email=$1', [email])).rowCount == 0;
        let username_is_unique = (await pool.query('select username from accounts where username=$1', [username])).rowCount == 0;

        if (!email_is_unique) return res.render('register', { email_existing: 'Email already used for other account.' })

        if (!username_is_unique) return res.render('register', { username_existing: 'Username already taken.' })


        //if all good, insert into DB unverified user

        let hashpw = await bcrypt.hash(pw, 10);

        //generate 16-char len email code
        const code = generator.generate({
            length: 16,
            numbers: true
        });

        await pool.query(`insert into accounts (username, hashpw, email, emailcode, verified)  
        values ($1,$2,$3,$4,false)`, [username, hashpw, email, code]);

        //send mail with code for verification, for optimization send to user that mail is already sent
        res.render('verify-email', { email });
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
            subject: 'Comms account verification',
            text: 'http://localhost:8080/verify/' + code + '/' + username
        };

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);

            }
        });


    } catch (error) {
        //register data verification and error handling is done on client-side, 
        //if user disables JS verification and enters invalid data, 
        //'not acceptable' code will be sent  
        if (error == 'client-err') return res.sendStatus(406);
        res.sendStatus(500); //500 otherwise
        console.log(error)
    }

})
app.get('/verify/:code/:username', async (req, res) => {
    try {
        let code = req.params.code;
        let username = req.params.username;
        let count = (await pool.query(`select username from accounts where emailcode=
        $1 and username=$2`, [code, username])).rowCount;
        if (count == 0) return res.sendStatus(404);
        await pool.query(`update accounts set verified=true, emailcode=null where  
        username=$1`, [username])
        res.render('verified', { username });
    } catch (error) {
        console.log(error)
        res.sendStatus(500);
    }

})

app.get('/login', (req, res) => {
    res.render('login');
})






app.post('/login', async (req, res) => {

    try {
        let email = req.body.email;
        let pw = req.body.password;
        //find user with req email and compare it's password with provided one
        let user = await pool.query('select hashpw, verified, banneduntil from accounts where email=$1', [email]);
        if (user.rowCount == 0) return res.render('login', { error: 'there is not an acc with that email' });
        let hashpw = user.rows[0].hashpw;
        let verified = user.rows[0].verified;

        let password_is_valid = await bcrypt.compare(pw, hashpw);
        if (!password_is_valid) return res.render('login', { error: 'wrong password. Forgot password?' });
        if (!verified) return res.render('login', { error: 'Please verify your email before logging in.' });
        //todo check if user is banned
        let is_banned = Boolean(user.rows[0].banneduntil);
        if (is_banned) {

            //check if ban has expired
            if (!isDateInPast(user.rows[0].banneduntil)) {
                return res.render('login', { error: 'You are banned until ' + formatDate(user.rows[0].banneduntil) });
            }


        }
        //from this line is code for successful login
        const user_object = {
            email: email,
            banneduntil: user.rows[0].banneduntil
        }
        //cookie_token is a secret string for each user which, if they are logged in, has to be provided with each http request.
        let cookie_token = jwt.sign(user_object, process.env.jwt_token_secret);

        if (req.body.remember) { // if user wants server to remember credentials

            // Set the cookie to expire in one year
            let expirationDate = new Date();
            expirationDate.setFullYear(expirationDate.getFullYear() + 1);

            //res.setHeader('Set-Cookie', ['session_token=' + cookie_token + ';' + 'expires=' + expirationDate.toUTCString() + ';']);
            res.cookie('session_token', cookie_token, {
                maxAge: 31536000000, // expires in 1y
                httpOnly: true
            });
            res.sendStatus(200);
            return;
        }
        res.cookie('session_token', cookie_token, {
            httpOnly: true
        });

        //res.setHeader('Set-Cookie', ['session_token=' + cookie_token]);
        res.sendStatus(200);
    } catch (error) {
        console.log(error)
    }
})

app.get('/logout', (req, res) => {
    res.clearCookie('session_token')

    res.sendStatus(200)
})




let auth_middleware = function (req, res, next) {
    let jwt_token = req.cookies.session_token
    if (!jwt_token) return res.redirect('/login'); //if auth cookie is absent
    jwt.verify(jwt_token, process.env.jwt_token_secret, (err, user) => {
        req.email=user.email; //attach user email to req object
        if (err) return res.redirect('/login'); //if auth cookie is invalid
        if (!user.banneduntil) return next(); //if user is not banned, proceed
        if (isDateInPast(user.banneduntil)) return next(); //if ban expired
        res.redirect('/login')
    });
}

//all requests after this line will use the auth middleware 
app.use(auth_middleware);
app.get('/authTEST', (req, res) => {
    res.sendStatus(200);
})


app.listen(port, () => console.log(`app listening on port ${port}`));