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

        var tmpPath = filePaths.georeference.tilesDir + '/tmp';


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

        cmd += filePaths.georeference.tiffDir + '/' + fileName + ' ';

        fileName = queryData.fileName.replace(' ','_');

        cmd += tmpPath + '/' + fileName;

        // creating tmp directory recursive
        if (!fs.existsSync(tmpPath))
            mkdirp.sync(tmpPath);

        if (fs.existsSync(tmpPath + '/' + fileName)) { // or fs.existsSync
            fs.unlink(tmpPath + '/' + fileName);
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
            cmd += tmpPath + '/' + fileName + ' ';
            cmd += tmpPath + '/' + fileName + '_geotiff';

            if (fs.existsSync(tmpPath + '/' + fileName + '_geotiff')) { // or fs.existsSync
                fs.unlink(tmpPath + '/' + fileName + '_geotiff');
            }

            console.log(cmd);
            exec(cmd, function (err, stdout, stderr) {
                if(err){
                    res.end(err);
                    return
                }

                console.log(stdout);
                console.log(stderr);

                fs.unlink(tmpPath + '/' + fileName);

                makeTiles(fileName);
                });
        });

        function makeTiles(fileName){

            cmd = 'gdal2tiles.py -z 7-8 --s_srs EPSG:900913 ';
            cmd += tmpPath + '/' + fileName + '_geotiff' + ' ';

            fileName = path.basename(fileName.replace(' ','_'),path.extname(fileName));
            console.log(fileName)

            cmd += tmpPath + '/' + fileName ;

            if (fs.existsSync(tmpPath + '/' + fileName)) { // or fs.existsSync
                rimraf(tmpPath + '/' + fileName,function(){});
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
                cmd += tmpPath + '/' + fileName + ' ';

                fileName = fileName.replace(' ','_');

                cmd += filePaths.georeference.tilesDir + '/' + fileName + '.mbtiles';

                if (fs.existsSync(filePaths.georeference.tilesDir + '/' + fileName + '.mbtiles')) { // or fs.existsSync
                    fs.unlink(filePaths.georeference.tilesDir + '/' + fileName + '.mbtiles');
                }


                console.log(cmd);
                exec(cmd, function (err, stdout, stderr) {
                    if(err){
                        res.end(err);
                        return
                    }

                    console.log(stdout);
                    console.log(stderr);

                    rimraf(tmpPath + '/' + fileName,function(){});

                    res.writeHead(200, {'Content-Type': 'text/plain'});
                    res.end(JSON.stringify({name:fileName}));
                    console.log('responds sent');
                });
            });
        }
    }
    //todo: send error
};


