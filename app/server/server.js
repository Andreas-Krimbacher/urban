//Require
var express = require('express');
var db = require('./db');
var fs = require('./fs');
var geo = require('./geo');
var up = require('./upload');

//Server
var app = express();

//Upload
app.use('/georeferenceUpload', up.georeference);

//Filesystem
app.get('/fs', fs);

//Database
app.get('/pg/getInfoEinheit/:id', db.getInfoEinheit);
app.get('/pg/deleteFeature/:id', db.deleteFeature);
app.get('/pg/deleteInfoEinheit/:id', db.deleteInfoEinheit);
app.get('/pg/getInfoEinheitenList', db.InfoEinheitenList);
app.post('/pg/saveInfoEinheit',express.bodyParser(), db.saveInfoEinheit);

//Geoservices
app.get('/geo', geo);



//export module
module.exports = app;