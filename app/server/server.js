//Require
var express = require('express');
var db = require('./db');
var fs = require('./fs');

//Server
var app = express();

//Filesystem
app.get('/fs', fs);

//Database
app.get('/pg/InfoElement/:id', db.InfoElement);

//export module
module.exports = app;