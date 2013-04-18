//Require
var express = require('express');
var db = require('./db');
var fs = require('./fs');
var geo = require('./geo');

//Server
var app = express();

//Filesystem
app.get('/fs', fs);

//Database
app.get('/pg/InfoElement/:id', db.InfoElement);

//Geoservices
app.get('/geo', geo);

//Upload
var upload = require('jquery-file-upload-middleware');
// configure upload middleware
var _baseDir = '/usr/share/opengeo-suite-data/geoserver_data/data/urban/imgServer';

upload.configure({
    uploadDir: _baseDir+'/upload',
    tiffDir: _baseDir+'/tiff',
    jpegDir: _baseDir+'/jpeg',
    uploadUrl: '/imgServer',
    tmpDir: _baseDir+'/tmp',
    thumbnailDir:  _baseDir+'/thumbnail',
    hostname: 'localhost:9000',
    imageVersions: {
        thumbnail: {
            width: 80,
            height: 80,
            quality: 'auto'
        }
    }
});

app.use('/uploadRaster', upload.fileHandler());


//export module
module.exports = app;