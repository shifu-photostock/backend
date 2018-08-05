"use strict";

const express = require('express');
const app = express();
const server = require('http').Server(app);
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
const config = require('./config/config');
const mongoose = require('mongoose');

app.use(cors());


app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'ejs');

const passport = require('passport');

var session = require("express-session")({
    secret: "my-secret",
    resave: true,
    saveUninitialized: true});

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