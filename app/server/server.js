//Require
var express = require('express');
var db = require('./db');
var fs = require('./fs');
var geo = require('./geo');
var up = require('./upload');

//Server
var app = express();

//Filesystem
app.get('/fs', fs);

//Database
app.get('/pg/InfoElement/:id', db.InfoElement);

//Geoservices
app.get('/geo', geo);

//Upload
app.use('/georeferenceUpload', up.georeference);


//export module
module.exports = app;