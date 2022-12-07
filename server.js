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

bcrypt.hash('pdsadsa', 10, function (err, hash) {
    console.log(hash.length)
    // Store hash in your password DB.
});

app.get('/register', (req, res) => {

    res.sendFile(__dirname + '/views/register.html');

})

app.post('/register', async (req, res) => {
    let CheckPassword = (txt) => {
        // check a password between {7,19} = 8 - 20 characters which contain at least one 
        // numeric digit, one uppercase and one lowercase letter
        let exp = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{7,19}$/;
        return (exp.test(txt));
    }

    let CheckUsername = (txt) => {
        //  A valid username should start with an alphabet so, 
        //[A-Za-z]. All other characters can be alphabets, numbers or an underscore so,
        //[A-Za-z0-9_] 
       
        let exp = /^[A-Za-z][A-Za-z0-9_]{7,19}$/;
        return (exp.test(txt));
    }

    let CheckEmail = (txt)=>{
        let exp = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return (exp.test(txt));
    }
    
    try {
        let pw=req.body.password;
        let username=req.body.password;
        let email=req.body.password;
        if(!CheckPassword(pw)) throw 'err';
        if(!CheckUsername(username)) throw 'err';
        if(!CheckEmail(email)) throw 'err';
        //todo if all good, insert into DB unverified user

    } catch (error) {
        //register data verification and error handling is done on client-side, 
        //if user disable JS verification and enter invadil data, 
        //'not acceptable' code will be sent  
        res.sendStatus(406);
    }

})

app.listen(port, () => console.log(`app listening on port ${port}`));