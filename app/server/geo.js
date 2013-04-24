var url = require('url');
var fs = require('fs');
var util = require('util');
var sys = require('sys');
var path = require('path');
var exec = require('child_process').exec;
var rimraf = require('rimraf');
var xml2js = require('xml2js');

var filePaths = require('./filePaths');


var parser = new xml2js.Parser();


module.exports = function(req, res) {
    var queryData = url.parse(req.url, true).query;
    if(queryData.action == 'save'){

        var tileDB = queryData.tileDB;

        fs.renameSync(filePaths.tiles.baseDir + '/' + 'tmp_' + tileDB + '.mbtiles', filePaths.tiles.baseDir + '/' + tileDB + '.mbtiles');
	    fs.renameSync(filePaths.tiles.baseDir + '/' + 'tmp_' + tileDB + '.json', filePaths.tiles.baseDir + '/' + tileDB + '.json');
        fs.renameSync(filePaths.tiles.tiffDir + '/' + 'tmp_' + tileDB + '.tiff', filePaths.tiles.tiffDir + '/' + tileDB + '.tiff');
        fs.renameSync(filePaths.tiles.thumbDir + '/' + 'tmp_' + tileDB + '.jpeg', filePaths.tiles.thumbDir + '/' + tileDB + '.jpeg');

        console.log('saved ' + tileDB);

        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.end('success');
    }
    if(queryData.action == 'deleteTmp'){

        var tileDB = queryData.tileDB;

        var file = filePaths.tiles.baseDir + '/' + 'tmp_' + tileDB + '.mbtiles';
        if (fs.existsSync(file)) { // or fs.existsSync
            fs.unlink(file);
        }
        file = filePaths.tiles.baseDir + '/' + 'tmp_' + tileDB + '.json';
        if (fs.existsSync(file)) { // or fs.existsSync
            fs.unlink(file);
        }
        file = filePaths.tiles.tiffDir + '/' + 'tmp_' + tileDB + '.tiff';
        if (fs.existsSync(file)) { // or fs.existsSync
            fs.unlink(file);
        }
        file = filePaths.tiles.thumbDir + '/' + 'tmp_' + tileDB + '.jpeg';
        if (fs.existsSync(file)) { // or fs.existsSync
            fs.unlink(file);
        }

        console.log('deleted ' + tileDB);

        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.end('success');
    }
    if(queryData.action == 'georefImg'){

        var origFileName = queryData.fileName;

        var now = new Date();
        var y = now.getFullYear()+'';
        y = y.substring(2,4);
        var m = now.getMonth()+1;
        if(m<10) m = '0'+m;
        var d = now.getDate();
        if(d<10) d = '0'+d;
        var h = now.getHours();
        if(h<10) h = '0'+h;
        var mi = now.getMinutes();
        if(mi<10) mi = '0'+mi;
        var s = now.getSeconds();
        if(s<10) s = '0'+s;

        var timeId = y+m+d+h+mi+s;
        var newBasename = timeId + '_' + origFileName.replace(' ','_');

        var gcp = queryData.gcp.split('|');

        // creating tmp directory recursive
        var tmpPath = filePaths.georeference.tilesDir + '/tmp';
        if (!fs.existsSync(tmpPath))
            fs.mkdirSync(tmpPath);

        //Add GCP
        var fileSrc = filePaths.georeference.tiffDir + '/' + origFileName;
        var fileDst = tmpPath + '/' + origFileName;
        addGCP(fileSrc,fileDst,gcp,res,function(){
            //Create GeoTiff
            fileSrc = fileDst;
            fileDst = tmpPath + '/' + newBasename;
            createGeoTiff(fileSrc,fileDst,res,function(){
                fs.unlink(fileSrc);
                //Create Tiles
                fileSrc = fileDst;
                fileDst = tmpPath + '/' + path.basename(fileDst, path.extname(fileDst));
                createTiles(fileSrc,fileDst,res,function(metadata){

                    var jsonData = createJsonData(metadata);

                    //Creta mbtiles DB
                    fileSrc = fileDst;
                    fileDst = fileDst + '.mbtiles';
                    createMbtilesDB(fileSrc,fileDst,res,function(){
                        rimraf(fileSrc,function(){});

                        jsonData.timeId = timeId;

                        var layerName = path.basename(fileSrc);
                        jsonData.tileDB = layerName;

                        //Move mbtiles
                        fileSrc = fileDst;
                        fileDst = filePaths.tiles.baseDir + '/' + 'tmp_' + layerName + '.mbtiles';
                        moveFile(fileSrc,fileDst,false);

                        //Move thumbnail
                        fileSrc = filePaths.georeference.thumbDir + '/' + path.basename(origFileName,path.extname(origFileName)) + '.jpeg';
                        fileDst = filePaths.tiles.thumbDir + '/' + 'tmp_' + layerName + '.jpeg';

                        if (!fs.existsSync(filePaths.tiles.thumbDir))
                            fs.mkdirSync(filePaths.tiles.thumbDir);

                        moveFile(fileSrc,fileDst,true);
                        jsonData.Thumbnail = 'thumbnail/' + layerName + '.jpeg';

                        //Move GeoTiff
                        fileSrc = tmpPath + '/' + layerName + '.tiff';
                        fileDst = filePaths.tiles.tiffDir + '/' + 'tmp_' + layerName + '.tiff';

                        if (!fs.existsSync(filePaths.tiles.tiffDir))
                            fs.mkdirSync(filePaths.tiles.tiffDir);

                        moveFile(fileSrc,fileDst,false);
                        jsonData.GeoTiff = 'tiff/' + layerName + '.tiff';

                        console.log('moved files');

                        //Create JsonData
                        fileDst = filePaths.tiles.baseDir + '/' + 'tmp_' + layerName + '.json';
//                        if (fs.existsSync(fileDst)) { // or fs.existsSync
//                            fs.unlink(fileDst);
//                        }
                        fs.appendFile(fileDst, JSON.stringify(jsonData, null, '\t'), function(err) {
                            if(err) {
                                res.end(err);
                                return
                            }

                            res.writeHead(200, {'Content-Type': 'text/plain'});
                            res.end(JSON.stringify(jsonData));
                            console.log('responds sent');

                        });


                    });
                });
            });
        });
    }
    //todo: send error
};

var addGCP = function(fileSrc,fileDst,gcp,res,callback){
    var cmd = 'gdal_translate ';
    var coords;
    for(var x in gcp){
        coords = gcp[x].split(',');
        cmd += '-gcp ';
        cmd += coords[0] + ' ';
        cmd += coords[1] + ' ';
        cmd += coords[2] + ' ';
        cmd += coords[3] + ' ';
    }
    cmd += fileSrc + ' ';
    cmd += fileDst;

    if (fs.existsSync(fileDst)) { // or fs.existsSync
        fs.unlink(fileDst);
    }

    console.log(cmd);
    exec(cmd, function (err, stdout, stderr) {
        if(err){
            res.end(err);
            return
        }

        console.log(stdout);
        console.log(stderr);

        callback();

    });
};

var createGeoTiff = function(fileSrc,fileDst,res,callback){
    var cmd = 'gdalwarp -t_srs EPSG:900913 -srcnodata 0 -dstalpha ';
    cmd += fileSrc + ' ';
    cmd += fileDst;

    if (fs.existsSync(fileDst)) { // or fs.existsSync
        fs.unlink(fileDst);
    }

    console.log(cmd);
    exec(cmd, function (err, stdout, stderr) {
        if(err){
            res.end(err);
            return
        }

        console.log(stdout);
        console.log(stderr);

        callback();
    });
};

var createTiles = function(fileSrc,fileDst,res,callback){
    var cmd = 'gdal2tiles.py -z 10-15 --s_srs EPSG:900913 -a 0 -w none ';
    cmd += fileSrc + ' ';
    cmd += fileDst;

    if (fs.existsSync(fileDst)) { // or fs.existsSync
        rimraf(fileDst,function(){});
    }

    console.log(cmd);
    exec(cmd, function (err, stdout, stderr) {
        if(err){
            res.end(err);
            return
        }

        console.log(stdout);
        console.log(stderr);


        fs.readFile(fileDst + '/tilemapresource.xml', function(err, data) {
            parser.parseString(data, function (err, result) {
                callback(result);
            });
        });
    });
};

var createMbtilesDB = function(fileSrc,fileDst,res,callback){
    var cmd = 'mb-util --scheme=tms --image_format=png ';
    cmd += fileSrc + ' ';
    cmd += fileDst;

    if (fs.existsSync(fileDst)) { // or fs.existsSync
        fs.unlink(fileDst);
    }

    console.log(cmd);
    exec(cmd, function (err, stdout, stderr) {
        if(err){
            res.end(err);
            return
        }

        console.log(stdout);
        console.log(stderr);

        callback();
    });
};

var createJsonData = function(metaData){
    var jsonData = {};

    metaData = metaData.TileMap;
    jsonData.SRS = metaData.SRS[0];
    jsonData.BoundingBox = metaData.BoundingBox[0].$;
    jsonData.Origin = metaData.Origin[0].$;
    jsonData.TileFormat = metaData.TileFormat[0].$;
    jsonData.TileSet = {profile : metaData.TileSets[0].$.profile,
                        minZoom :  metaData.TileSets[0].TileSet[0].$.order,
                        maxZoom : metaData.TileSets[0].TileSet[metaData.TileSets[0].TileSet.length-1].$.order,
			maxRes : metaData.TileSets[0].TileSet[0].$['units-per-pixel'],
			minRes : metaData.TileSets[0].TileSet[metaData.TileSets[0].TileSet.length-1].$['units-per-pixel']};

    return jsonData;
};

var moveFile = function(fileSrc,fileDst,keepSrc){
    if (fs.existsSync(fileDst)) { // or fs.existsSync
        fs.unlinkSync(fileDst);
    }

    var is = fs.createReadStream(fileSrc)
    var os = fs.createWriteStream(fileDst);

    util.pump(is, os, function() {
        if(!keepSrc) fs.unlinkSync(fileSrc);
    });
};