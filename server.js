// TODO
//     1.Create accounts databse ✔️
//          [acc types: admin, user, guest] 
//          user can be banned

//     2. Create register user system, store hashed passwords in database 
//            register route
// 
// 
require('dotenv').config(); //database credentials stored in .env
let path = require('path');
const pg = require('pg');
const express = require('express');
const router = express.Router();
const app = express();
const port = 8080;
const bcrypt = require('bcrypt');
const generator = require('generate-password');
const nodemailer = require('nodemailer');

//functions for login and register checks




app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: false }));

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
        //check if email and username are valid, checked on client side as well
        let CheckPassword = (txt) => {
            // check a password between {7,19} = 8 - 20 characters which contain at least one 
            // numeric digit, one uppercase and one lowercase letter
            let exp = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{7,31}$/;
            return (exp.test(txt));
        }
        
        let CheckUsername = (txt) => {
            //  A valid username should start with an alphabet so, 
            //[A-Za-z]. All other characters can be alphabets, numbers or an underscore so,
            //[A-Za-z0-9_] 
        
            let exp = /^[A-Za-z][A-Za-z0-9_]{3,19}$/;
            return (exp.test(txt));
        }
        
        let CheckEmail = (txt) => {
            let exp = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return (exp.test(txt));
        }
        
        
        let pw = req.body.password;
        let username = req.body.username;
        let email = req.body.email;
        if (!CheckPassword(pw)) throw 'client-err';
        if (!CheckUsername(username)) throw 'client-err';
        if (!CheckEmail(email)) throw 'client-err';


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
        res.render('verified',{username});
    } catch (error) {
        console.log(error)
        res.sendStatus(500);
    }

})

app.post('/login',async (req,res)=>{
   
    try {
        let email = req.body.email;
        let pw = req.body.password;
        //find user with req email and compare it's password with provided one
        let user = await pool.query('select hashpw, verified from accounts where email=$1',[email]);
        if(user.rowCount==0) return res.render('login',{error: 'there is not an acc with that email'});
        let hashpw = user.rows[0].hashpw;
        let verified=user.rows[0].verified;
        console.log(hashpw)
        let password_is_valid = await bcrypt.compare(pw,hashpw);
        if(!password_is_valid) return res.render('login',{error: 'wrong password. Forgot password?'});
        if(!verified) return res.render('login',{error: 'Please verify your email before logging in.'});
        //from this line is code for successful login
        res.sendStatus(200);
    } catch (error) {
        console.log(error)
    }
})

app.listen(port, () => console.log(`app listening on port ${port}`));