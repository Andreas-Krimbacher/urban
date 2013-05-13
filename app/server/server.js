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

//Request only with infoEinheit id
app.get('/imageUpload/:infoEinheit', up.image);
app.post('/imageUpload/:infoEinheit', up.image);
app.delete('/imageUpload/:infoEinheit/:file', up.image);

//Request with infoEinheit id and feature id
app.get('/imageUpload/:infoEinheit/:feature', up.image);
app.post('/imageUpload/:infoEinheit/:feature', up.image);
app.delete('/imageUpload/:infoEinheit/:feature/:file', up.image);

//Filesystem
app.get('/fs', fs);

//Database
app.get('/pg/getInfoEinheit/:infoEinheit', db.getInfoEinheit);
app.get('/pg/deleteFeature/:infoEinheit/:feature', db.deleteFeature);
app.get('/pg/deleteInfoEinheit/:infoEinheit', db.deleteInfoEinheit);
app.get('/pg/getInfoEinheitenList', db.InfoEinheitenList);
app.post('/pg/saveInfoEinheit',express.bodyParser(), db.saveInfoEinheit);

app.get('/pg/getLernEinheitList', db.LernEinheitList);
app.get('/pg/getLernEinheit/:lernEinheit', db.getLernEinheit);
app.post('/pg/saveLernEinheit',express.bodyParser(), db.saveLernEinheit);
app.get('/pg/deleteLernFeature/:feature', db.deleteLernFeature);
app.get('/pg/deleteLernLektion/:lektion', db.deleteLernLektion);
app.get('/pg/deleteLernEinheit/:einheit', db.deleteLernEinheit);

//Geoservices
app.get('/geo', geo);



//export module
module.exports = app;