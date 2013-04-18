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
        var cmd = 'gdal_translate ';

        var gcp = queryData.gcp.split('|');
        var coords;
        for(var x in gcp){
            coords = gcp[x].split(',');
            cmd += '-gcp ';
            cmd += coords[0] + ' ';
            cmd += coords[1] + ' ';
            cmd += coords[2] + ' ';
            cmd += coords[3] + ' ';
        }

        var fileName = queryData.fileName.replace(' ','\\ ');

        cmd += filePaths.uploadTiffFolder + '/' + fileName + ' ';

        fileName = queryData.fileName.replace(' ','_');

        cmd += filePaths.rasterTmpFolder + '/' + fileName;

        if (path.existsSync(filePaths.rasterTmpFolder + '/' + fileName)) { // or fs.existsSync
            fs.unlink(filePaths.rasterTmpFolder + '/' + fileName);
        }

        console.log(cmd);
        exec(cmd, function (err, stdout, stderr) {
            if(err){
                res.end(err);
                return
            }

            console.log(stdout);
            console.log(stderr);

            cmd = 'gdalwarp -t_srs EPSG:900913 -srcnodata 0 -dstalpha ';
            cmd += filePaths.rasterTmpFolder + '/' + fileName + ' ';
            cmd += filePaths.rasterFolder + '/' + fileName;

            if (path.existsSync(filePaths.rasterFolder + '/' + fileName)) { // or fs.existsSync
                fs.unlink(filePaths.rasterFolder + '/' + fileName);
            }

            console.log(cmd);
            exec(cmd, function (err, stdout, stderr) {
                if(err){
                    res.end(err);
                    return
                }

                console.log(stdout);
                console.log(stderr);

                fs.unlink(filePaths.rasterTmpFolder + '/' + fileName);

                makeTiles(fileName);
                });
        });

        function makeTiles(fileName){

            cmd = 'gdal2tiles.py -z 7-15 --s_srs EPSG:900913 ';
            cmd += filePaths.rasterFolder + '/' + fileName + ' ';

            fileName = path.basename(fileName.replace(' ','_'),path.extname(fileName));
            console.log(fileName)

            cmd += filePaths.tilesTmpFolder + '/' + fileName;

            if (path.existsSync(filePaths.tilesTmpFolder + '/' + fileName)) { // or fs.existsSync
                rimraf(filePaths.tilesTmpFolder + '/' + fileName,function(){});
            }

            console.log(cmd);
            exec(cmd, function (err, stdout, stderr) {
                if(err){
                    res.end(err);
                    return
                }

                console.log(stdout);
                console.log(stderr);

                cmd = 'mb-util --scheme=tms --image_format=png ';
                cmd += filePaths.tilesTmpFolder + '/' + fileName + ' ';

                fileName = fileName.replace(' ','_');

                cmd += filePaths.tilesFolder + '/' + fileName + '.mbtiles';

                if (path.existsSync(filePaths.tilesFolder + '/' + fileName + '.mbtiles')) { // or fs.existsSync
                    fs.unlink(filePaths.tilesFolder + '/' + fileName + '.mbtiles');
                }


                console.log(cmd);
                exec(cmd, function (err, stdout, stderr) {
                    if(err){
                        res.end(err);
                        return
                    }

                    console.log(stdout);
                    console.log(stderr);

                    rimraf(filePaths.tilesTmpFolder + '/' + fileName,function(){});

                    res.writeHead(200, {'Content-Type': 'text/plain'});
                    res.end(JSON.stringify({name:fileName}));
                    console.log('responds sent');
                });
            });
        }
    }
    //todo: send error
};


