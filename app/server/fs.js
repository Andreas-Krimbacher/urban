/**
 * Server module file system querys
 * @name Server:fs
 * @namespace
 * @author Andreas Krimbacher
 */
var url = require('url');
var fs = require('fs');
var path = require('path');
var gm = require('gm');
var filePaths = require('./filePaths');
// http://nodejs.org/api.html#_child_processes
var sys = require('sys');
var exec = require('child_process').exec;
var child;

var counter;
var finish;

module.exports = function(req, res) {
    var queryData = url.parse(req.url, true).query;
	/**
     * gives a list of images that are stored on the server for georeferencing
     * @name Server:fs#action=georeferenceFileList
     */
    if(queryData.action == 'georeferenceFileList'){
        counter = 1;
        finish = function(respond){
            if (!--counter) {
                res.writeHead(200, {'Content-Type': 'text/plain'});
                res.end(JSON.stringify(respond));
            }
        };

        //get image list
        fs.readdir(filePaths.georeference.jpegDir + '/',function(err,files){
            if(err){
                res.end(err);
                return
            }

            var respond = [];

            var x;
            for(x = 0; x < files.length; x++){
                if(path.extname(files[x]) == '.jpeg') respond.push({name: files[x], path:filePaths.georeference.serverJpegUrl + '/' + files[x]});
                getImgSize(respond,x);
            }
            finish(respond);
        });

        //get the size of an image
        var getImgSize = function(respond,index){
            counter++;
            gm(filePaths.georeference.jpegDir + '/' + respond[index].name).size(function (err, size) {
                if(err){
                    res.end(err);
                    return
                }

                respond[index].width = size.width;
                respond[index].height = size.height;

                finish(respond);
            });
        };
    }
	/**
     * gives a list of all plans (tile layers) available on the server
     * @name Server:fs#action=planList
     */
    if(queryData.action == 'planList'){
        counter = 1;
        var respond = [];

        finish = function(){
            if (!--counter) {
                res.writeHead(200, {'Content-Type': 'text/plain'});
                res.end(JSON.stringify(respond));
            }
        };

        //get plan list
        fs.readdir(filePaths.tiles.baseDir + '/',function(err,files){
            if(err){
                res.end(err);
                return
            }

            var x;
            for(x = 0; x < files.length; x++){
                if(path.extname(files[x]) == '.mbtiles') getMetaData(files[x]);
            }
            finish();
        });

        //get metadata
        var getMetaData = function(name){
            counter++;
            var file = filePaths.tiles.baseDir + '/' + path.basename(name,path.extname(name)) + '.json';

            fs.readFile(file,{encoding : 'utf8'},function (err, data) {
                if(err){
                    res.end(err);
                    return
                }

                respond.push(JSON.parse(data));
                finish();
            });
        }
    }
};
