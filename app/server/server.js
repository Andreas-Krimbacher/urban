/**
 * Server main file, exports the express object to the grunt server
 * @name Server
 * @namespace
 * @author Andreas Krimbacher
 */
var express = require('express');
var db = require('./db');
var fs = require('./fs');
var geo = require('./geo');
var up = require('./upload');

//Server
var app = express();

//Filesystem
app.get('/fs', fs);

//Geoservices
app.get('/geo', geo);

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

//Database
    //Info-Einheit and info-Feature
app.get('/pg/getInfoEinheitenList', db.InfoEinheitenList);
app.get('/pg/getInfoEinheit/:einheit', db.getInfoEinheit);

app.post('/pg/saveInfoEinheit',express.bodyParser(), db.saveInfoEinheit);

app.delete('/pg/deleteFeature/:einheit/:feature', db.deleteFeature);
app.delete('/pg/deleteInfoEinheit/:einheit', db.deleteInfoEinheit);

    //Lern-Einheit, Lern-Lektion und Lern-Feature
app.get('/pg/getLernEinheitList', db.LernEinheitList);
app.get('/pg/getLernEinheit/:einheit', db.getLernEinheit);

app.post('/pg/saveLernEinheit',express.bodyParser(), db.saveLernEinheit);

app.delete('/pg/deleteLernFeature/:feature', db.deleteLernFeature);
app.delete('/pg/deleteLernLektion/:lektion', db.deleteLernLektion);
app.delete('/pg/deleteLernEinheit/:einheit', db.deleteLernEinheit);

//export module
module.exports = app;