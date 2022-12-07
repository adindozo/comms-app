// TODO
//     1.Create accounts databse
//          [acc types: admin, user, guest] 
//          user can be banned

//     2. Create register user system, store hashed passwords in database 
//            register route
// 
// 
require('dotenv').config(); //database credentials stored in .env
const pg = require('pg');
const express = require('express');
const router = express.Router();
const app = express();
const port = 8080;
const bcrypt = require('bcrypt');

let dbconfig = { //database credentials stored in object
    user: process.env.user,
    database: process.env.database,
    password: process.env.password,
    host: process.env.host,
    port: parseInt(process.env.port)
}

const pool = new pg.Pool(dbconfig); //creating db pool

bcrypt.hash('pdsadsa', 10, function(err, hash) {
    console.log(hash.length)
    // Store hash in your password DB.
});

app.get('/', async (req, res) => {
    try {
        let result = await pool.query('select * from test');
        console.log(result);
    } catch (error) {
        console.log(error);
    }
})

app.listen(port, () => console.log(`app listening on port ${port}`));