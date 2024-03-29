require('dotenv').config(); //database credentials stored in .env
const bcrypt = require('bcrypt');
const generator = require('generate-password');
const nodemailer = require('nodemailer');
const Filter = require('bad-words');
const jwt = require('jsonwebtoken');
let path = require('path');
const pg = require('pg');
const express = require('express');
let cookies = require("cookie-parser");
const bodyParser = require('body-parser');
const nocache = require('nocache');
const { formatDate, isDateInPast, checkPassword, checkEmail, checkUsername, currentTimeInUnixTimestamp } = require('./public/functions');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const port = process.env.PORT || 8080;
app.use(nocache()); //disabling cache fixes some logging in related bugs

let dbconfig = { //database credentials stored in object
    user: process.env.user,
    database: process.env.database,
    password: process.env.password,
    host: process.env.host,
    port: parseInt(process.env.port)
}




app.set('view engine', 'ejs');
//app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json({ limit: '1mb' }));
app.use(bodyParser.urlencoded({ limit: '1mb', extended: true }));
app.use(cookies());
app.use(express.static('public'));


const pool = new pg.Pool(dbconfig); //creating db pool

//route logger
// app.use((req, res, next) => {
//     console.log(req.url); next();
// })


app.get('/', (req, res) => { //if logged in user is accessing log in page, show his name and anchor for his meetings, else show log in and register buttons
    let jwt_token = req.cookies.session_token
    if (!jwt_token) return res.render('home'); //if auth cookie is absent
    jwt.verify(jwt_token, process.env.jwt_token_secret, (err, user) => {

        if (err) return res.render('home'); //if auth cookie is invalid
        if (!user.banneduntil) return res.render('home', { username: user.username, role: user.role }); //if user is not banned, proceed
        if (isDateInPast(user.banneduntil)) return res.render('home', { username: user.username, role: user.role }); //if ban expired, proceed
        res.render('home');
        
        
    });
})


const registerRouter = require('./routes/auth/register');
app.use('/register', registerRouter);

const verifyRouter = require('./routes/auth/verify');
app.use('/verify', verifyRouter);

const logoutRouter = require('./routes/auth/logout');
app.use('/logout', logoutRouter);

const loginRouter = require('./routes/auth/login');
app.use('/login', loginRouter);

const resetpwRouter = require('./routes/auth/resetpw');
app.use('/resetpassword', resetpwRouter);


const join_meetingRouter = require('./routes/join_meeting');
app.use('/join_meeting', join_meetingRouter);

const questionsRouter = require('./routes/questions');
app.use('/questions', questionsRouter);


//when user connects on web socket, push all questions from that meeting to user and populate DOM tree
io.on('connection', (socket) => {
    // setInterval(() => {
    //     socket.emit('only-to-socket','private');
    //     io.emit('to-all-sockets','public');
    //     io.broadcast.emit('to-all-sockets-except-sender','public');
    // }, 1000);
    

    socket.on('answer_question', async (question_id)=>{
        await pool.query('update questions set answered = true where questionid = $1',[question_id]);
        io.emit('remove_question', question_id);


    })
    socket.on('questions-req', async (meetingid) => {
        try {
            //join socket to room first
            socket.join(meetingid);
            let questions = (await pool.query('select * from questions where meetingid=$1', [meetingid])).rows;
            socket.emit('questions-res', questions);
            //socket.emit sends only to connected user, io.emit sends to everyone
        } catch (error) {
            console.log(error);
        }
       
    })
    socket.on('add_question_fromClient', async (question_object, room) => {
        if (question_object.question.length == 0 || question_object.question.length > 120 || question_object.username > 30) return;
        try {
            //retrieve list of "bad" words from database, purify question and then add that question to database and push to other clients
            const filter = new Filter();
            let newBadWords=[];
            let newBadWordsObj = (await pool.query('select word from forbidden_words')).rows;
            for(let word of newBadWordsObj){
                newBadWords.push(word.word);
            }
            filter.addWords(...newBadWords); //... is spread operator
            question_object.question=filter.clean(question_object.question);
            let new_question = (await pool.query(`insert into questions (question, likesnumber, answered, meetingID,username,unixtime) values
            ($1, $2,$3,$4,$5,$6) returning *`, [question_object.question, 0, false, question_object.meetingid, (question_object.username ? question_object.username : null), currentTimeInUnixTimestamp()])).rows[0];
            io.in(room).emit('new_question', new_question); //io.to and io.in is same
        } catch (error) {
            console.log(error);
        }
        
    })

   

    socket.on('update_like_count', async (question_id, n)=>{
        try {
            await pool.query('update questions set likesnumber = $1 where questionid = $2',[n,question_id]);
            io.emit('update_like_count_fromServer',question_id,n);
        } catch (error) {
            console.log(error)
        }
        
       
    })
});


let auth_middleware =  function (req, res, next) {
    let jwt_token = req.cookies.session_token
    if (!jwt_token) return res.redirect('/login'); //if auth cookie is absent
    jwt.verify(jwt_token, process.env.jwt_token_secret, async(err, user) => {
        try {
            let banneduntil_fresh = (await pool.query('select banneduntil from accounts where accountid=$1',[user.accountid])).rows[0].banneduntil;
            user.banneduntil=banneduntil_fresh;
            req.user = user; //attach user info to req object
            if (err) return res.redirect('/logout'); //if auth cookie is invalid
            if (!user.banneduntil) return next(); //if user is not banned, proceed
            if (isDateInPast(user.banneduntil)) return next(); //if ban expired, proceed
            res.redirect('/logout')
        } catch (error) {
            return res.sendStatus(500);
            console.log(error)
        }
        
    });
}
//all requests after this line will use the auth middleware, user info(from database) is in req.user object.
/*-----------------------------------*/app.use(auth_middleware);/*----------------------------------------*/


app.get('/authTEST', (req, res) => {
    res.sendStatus(200);
    console.log(req.user)
})

const mymeetingsRouter = require('./routes/mymeetings');
app.use('/mymeetings', mymeetingsRouter);



const send_mailRouter = require('./routes/send_mail');
app.use('/send_mail', send_mailRouter)



const share_codeRouter = require('./routes/share_code');
app.use('/share_code', share_codeRouter);


let admin_auth_middleware = (req,res,next)=>{
    if(req.user.role=='admin') next(); else res.sendStatus(403);
    
}

//all requests after this line will use the admin auth middleware, user info(from database) is in req.user object.
/*-----------------------------------*/app.use(admin_auth_middleware);/*----------------------------------------*/

const adminRouter = require('./routes/admin');
app.use('/admin', adminRouter);

server.listen(port, () => {
    console.log('listening on port'+port);
});