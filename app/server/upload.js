var filePaths = require('./filePaths');
var easyimg = require('easyimage');
var fs = require('fs');
var path = require('path');

var uploadGeoreference = require('jquery-file-upload-middleware');

uploadGeoreference.configure({
    uploadDir:filePaths.georeference.uploadDir,
    uploadUrl: filePaths.georeference.serverUrl,
    tmpDir:'/tmp',
    hostname: 'localhost:9000',
    imageTypes: /\.(gif|jpe?g|png|tif?f)$/i,
    imageVersions: {
        thumbnail: {
            width: 80,
            height: 80,
            dir: filePaths.georeference.thumbDir,
            url: filePaths.georeference.serverThumbUrl,
            extname: 'jpeg',
            process: function(options,opts,fileInfo,callback){
                console.log('process thumbnail');

                easyimg.resize({
                    width: opts.width,
                    height: opts.height,
                    src: options.imageVersions.jpeg.dir + '/' + path.basename(fileInfo.name, path.extname(fileInfo.name)) + '.' + options.imageVersions.jpeg.extname,
                    dst: opts.dir + '/' + path.basename(fileInfo.name, path.extname(fileInfo.name)) + '.' + opts.extname
                },function(err, stdout, stderr) {
                    if (err) throw err;
                    console.log('Converted to thumbnail');
                    callback();
                });
            }
        },
        jpeg : {
            quality: 'auto',
            dir: filePaths.georeference.jpegDir,
            url: filePaths.georeference.serverJpegUrl,
            extname: 'jpeg',
            process: function(options,opts,fileInfo,callback){
                console.log('process jpeg');

                //jpeg creation is done in the beforeProcessing function

                callback();
            }
        },
        tiff : {
            dir: filePaths.georeference.tiffDir,
            extname: 'tiff',
                url: filePaths.georeference.serverTiffUrl,
            process: function(options,opts,fileInfo,callback){
                console.log('process tiff');

                easyimg.convert({src:options.uploadDir() + '/' + fileInfo.name,
                        dst:opts.dir + '/' + path.basename(fileInfo.name, path.extname(fileInfo.name)) + '.' + opts.extname},
                    function(err, stdout, stderr) {
                        if (err) throw err;
                        console.log('Converted to tiff');
                        callback();
                    });
            }
        }
    },
    beforeProcessing: function(options,fileInfo,callback){
        console.log('pre process - file: '+fileInfo.name);

        var opts = options.imageVersions.jpeg;

        var quality;
        if(opts.quality == 'auto'){
            var stats = fs.lstatSync(options.uploadDir() + '/' + fileInfo.name);
            if(stats.size > 100000000) quality = 20;
            else if(stats.size > 50000000) quality = 30;
            else if(stats.size > 40000000) quality = 40;
            else if(stats.size > 30000000) quality = 50;
            else if(stats.size > 20000000) quality = 60;
            else if(stats.size > 10000000) quality = 70;
            else if(stats.size > 5000000) quality = 80;
            else quality = 90;
        }
        else{
            quality = opts.quality;
        }
        console.log('quality set to: '+quality);
        easyimg.convert({src:options.uploadDir() + '/' + fileInfo.name,
                dst:opts.dir + '/' + path.basename(fileInfo.name, path.extname(fileInfo.name)) + '.' + opts.extname,
                quality:quality},
            function(err, stdout, stderr) {
                if (err) throw err;
                console.log('Converted to jpeg');
                callback();
            });

    }
//    getFileList: function(options,callback){
//        console.log('getFileList');
//
//
//    }
});

module.exports = {
    georeference: uploadGeoreference.fileHandler()
};
