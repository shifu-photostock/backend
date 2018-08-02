"use strict";

const express = require('express');
const app = express();
const server = require('http').Server(app);
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const path = require('path');


const config = require('./config/index');

const dbURI = "mongodb://" +
    encodeURIComponent(config.db.username) + ":" +
    encodeURIComponent(config.db.password) + "@" +
    config.db.host + ":" +
    config.db.port + "/" +
    config.db.name;

mongoose.connect(dbURI, console.log('Succes!'));
mongoose.Promise = require('bluebird');
mongoose.set('debug', true);

app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'ejs');

//For public directory
app.use(express.static(__dirname + '/public'));
app.use(express.static('public'));
app.use(express.static(path.join(__dirname, 'public')));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());


require('./router/router')(app);

server.listen(8888, () => {
    console.log('Server started on port 8888');
});