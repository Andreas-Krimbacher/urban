var url = require('url');
var fs = require('fs');
var path = require('path');

var gm = require('gm');

var dataDir = '/usr/share/opengeo-suite-data/geoserver_data/data/urban';

module.exports = function(req, res) {
    var queryData = url.parse(req.url, true).query;
    if(queryData.action == 'imgFileList'){
        fs.readdir(dataDir,function(err,files){
            if(err){
                res.end(err);
                return
            }

            var respond = [];

            for(var x in files){
                if(path.extname(files[x]) == '.jpg') respond.push(files[x]);
            }

            res.writeHead(200, {'Content-Type': 'text/plain'});
            res.end(JSON.stringify(respond));
        });
    }
    if(queryData.action == 'imgSize'){
        gm(dataDir+'/sketch.jpg').size(function (err, size) {
            if(err){
                res.end(err);
                return
            }
            res.writeHead(200, {'Content-Type': 'text/plain'});
            res.end(JSON.stringify(size));
        });


    }
    //todo: send error
};
