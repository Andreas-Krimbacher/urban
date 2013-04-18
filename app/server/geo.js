var url = require('url');
var fs = require('fs');
var sys = require('sys')
var exec = require('child_process').exec;

var dataDir = '/usr/share/opengeo-suite-data/geoserver_data/data/urban';
var tiffDir = '/imgServer/tiff';
var rasterTmpDir = '/geoserverData/tmp';
var rasterDir = '/geoserverData';

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

        cmd += '.' + tiffDir + '/' + fileName + ' ';
        cmd += '.' + rasterTmpDir + '/' + fileName;

        console.log(dataDir);
        console.log(cmd);
        exec(cmd,{cwd:dataDir}, function (err, stdout, stderr) {
            if(err){
                res.end(err);
                return
            }

            console.log(stdout);
            console.log(stderr);

            cmd = 'gdalwarp -t_srs EPSG:900913 -r lanczos ';
            cmd += '.' + rasterTmpDir + '/' + fileName + ' ';
            cmd += '.' + rasterDir + '/' + fileName;


            console.log(dataDir);
            console.log(cmd);
            exec(cmd,{cwd:dataDir}, function (err, stdout, stderr) {
                if(err){
                    res.end(err);
                    return
                }

                console.log(stdout);
                console.log(stderr);

                fs.unlink(dataDir + rasterTmpDir + '/' + queryData.fileName);

                res.writeHead(200, {'Content-Type': 'text/plain'});
                res.end('success');
                });
        });
    }
    //todo: send error
};
