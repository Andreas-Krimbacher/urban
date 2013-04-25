//Require
var express = require('express');
var db = require('./db');
var fs = require('./fs');
var geo = require('./geo');
var up = require('./upload');

//Server
var app = express();
app.use(express.bodyParser());

//Filesystem
app.get('/fs', fs);

//Database
app.get('/pg/getInfoEinheit/:id', db.getInfoEinheit);
app.get('/pg/deleteFeature/:id', db.deleteFeature);
app.get('/pg/deleteInfoEinheit/:id', db.deleteInfoEinheit);
app.get('/pg/getInfoEinheitenList', db.InfoEinheitenList);
app.post('/pg/saveInfoEinheit', db.saveInfoEinheit);

//Geoservices
app.get('/geo', geo);

//Upload
app.use('/georeferenceUpload', up.georeference);


//export module
module.exports = app;