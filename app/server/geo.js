var url = require('url');
var fs = require('fs');
var sys = require('sys');
var path = require('path');
var exec = require('child_process').exec;
var rimraf = require('rimraf');

var filePaths = require('./filePaths');




module.exports = function(req, res) {
    var queryData = url.parse(req.url, true).query;
    if(queryData.action == 'georefImg'){

        var origFileName = queryData.fileName;

        var gcp = queryData.gcp.split('|');

        // creating tmp directory recursive
        var tmpPath = filePaths.georeference.tilesDir + '/tmp';
        if (!fs.existsSync(tmpPath))
            mkdirp.sync(tmpPath);

        //Add GCP
        var fileSrc = filePaths.georeference.tiffDir + '/' + origFileName;
        var fileDst = tmpPath + '/' + origFileName.replace(' ','_');
        addGCP(fileSrc,fileDst,gcp,res,function(){
            //Create GeoTiff
            fileSrc = fileDst;
            fileDst = tmpPath + '/' + path.basename(origFileName.replace(' ','_'), path.extname(origFileName)) + '1234' + path.extname(origFileName);
            createGeoTiff(fileSrc,fileDst,res,function(){
                fs.unlink(fileSrc);
                //Create Tiles
                fileSrc = fileDst;
                fileDst = tmpPath + '/' + path.basename(fileDst, path.extname(fileDst));
                createTiles(fileSrc,fileDst,res,function(){
                    //Creta mbtiles DB
                    fileSrc = fileDst;
                    fileDst = fileDst + '.mbtiles';
                    createMbtilesDB(fileSrc,fileDst,res,function(){
                        rimraf(fileSrc,function(){});

                        fs.createReadStream(fileDst).pipe(fs.createWriteStream(filePaths.tiles.baseDir + '/' + path.basename(fileSrc) + '.mbtiles'));
                        console.log('copy from ' + fileDst + ' to ' + filePaths.tiles.baseDir + '/' + path.basename(fileSrc) + '.mbtiles');

                        res.writeHead(200, {'Content-Type': 'text/plain'});
                        res.end(JSON.stringify({name:path.basename(fileSrc)}));
                        console.log('responds sent');
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
    var cmd = 'gdal2tiles.py -z 7-17 --s_srs EPSG:900913 ';
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

        callback();
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
