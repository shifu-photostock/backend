"use strict";

const express = require('express');
const app = express();
const server = require('http').Server(app);
const bodyParser = require('body-parser');
const path = require('path');


app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'ejs');

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

require('./router/router')(app);

server.listen(8888, () => {
    console.log('Server started on port 8888');
});