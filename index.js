"use strict";

const express = require('express');
const app = express();
const server = require('http').Server(app);
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
const config = require('./config/config');
const mongoose = require('mongoose');
const winston = require('winston');
const cookieParser = require('cookie-parser');


// //THIS!!!
// app.use(cors({
//     origin: ['http://127.0.0.1:8080',],
//     methods: ['GET', 'POST'],
//     credentials: true// enable set cookie
// }));
// var allowCrossDomain = function(req, res, next) {
//     res.header('Access-Control-Allow-Origin', '*');
//     res.header('Access-Control-Allow-Credentials', true);
//     res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
//     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//     next();
// };

// app.use(cors({credentials: true // enable set cookie
// }));

// //THIS!!!
// app.use(function(req, res, next) {
//     console.log("WORKING!!!");
//     res.header("Access-Control-Allow-Origin", req.headers.origin);
//     res.header('Access-Control-Allow-Credentials', true);
//     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//     next(); });

// app.all('', function(req, res, next) {
//     console.log("WORKING!!!");
//     res.header("Access-Control-Allow-Origin", "*");
//     res.header('Access-Control-Allow-Credentials', true);
//     res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
//     res.header('Access-Control-Allow-Headers', "Origin, X-Requested-With, Content-Type, Accept, Authorization");
// //Auth Each API Request created by user.
//     next();
// });
//
// app.use(allowCrossDomain);

app.use(cookieParser("my-secret"));

const logger = winston.createLogger({
    level: 'silly',
    format: winston.format.json(),
    transports: [
        //
        // - Write to all logs with level `info` and below to `combined.log`
        // - Write all logs error (and below) to `error.log`.
        //
        new winston.transports.File({ filename: 'error.log', level: 'error', 'timestamp':true}),
        new winston.transports.File({ filename: 'combined.log', 'timestamp':true})
    ]
});

logger.info('Hello again distributed logs');

app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'ejs');

const passport = require('passport');

var session = require("express-session")({
    secret: "my-secret",
    resave: true,
    saveUninitialized: true,
    cookie: {secure: false,
        httpOnly: false}});

app.use(session); //session secret WTF?
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
require('./config/passport')(passport); // pass passport for configuration


var dbURI = "mongodb://" +
    encodeURIComponent(config.db.username) + ":" +
    encodeURIComponent(config.db.password) + "@" +
    config.db.host + ":" +
    config.db.port + "/" +
    config.db.name;

mongoose.connect(dbURI, console.log('Succes!'));
mongoose.Promise = require('bluebird');
mongoose.set('debug', true);


// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

require('./router/router')(app, passport);

server.listen(8888, () => {
    console.log('Server started on port 8888');
});