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
const { use } = require('bcrypt/promises');

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
    console.log(hash)
    // Store hash in your password DB.
});

app.get('/register', (req, res) => {

    res.render('register');

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
        let username=req.body.username;
        let email=req.body.email; 
        if(!CheckPassword(pw)) throw 'client-err'; 
        if(!CheckUsername(username)) throw 'client-err'; 
        if(!CheckEmail(email)) throw 'client-err';     
      
        
        //check if email and username are unique

            
        let email_is_unique = await pool.query('select email from accounts where email=$1', [email]).rowCount==0;
        let username_is_unique = await pool.query('select username from accounts where username=$1', [username]).rowCount==0;
        
        if(!email_is_unique) return res.render('register',{email_existing: 'Email already used for other account.' })
        if(!username_is_unique) return res.render('register',{username_existing: 'Username already taken.' })

        
        //todo if all good, insert into DB unverified user

        
        await pool.query(`insert into accounts (username, hashpw, email, verified)  
        values ('$1','$2','$3',false)'`,[username,hashpw,email]);

       

    } catch (error) {
        //register data verification and error handling is done on client-side, 
        //if user disables JS verification and enters invalid data, 
        //'not acceptable' code will be sent  
        if(error='client-err') return res.sendStatus(406);
        res.sendStatus(500); //500 otherwise
    }

})

app.listen(port, () => console.log(`app listening on port ${port}`));