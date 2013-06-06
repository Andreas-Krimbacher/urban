/**
 * Servermodule for the file upload, configure the jQueryFileUploadMiddleware
 * @name Server:upload
 * @namespace
 * @author Andreas Krimbacher
 */
var filePaths = require('./filePaths');
var easyimg = require('easyimage');
var fs = require('fs');
var path = require('path');
var exec = require('child_process').exec;

var jQueryFileUploadMiddleware = require('jquery-file-upload-middleware');

var uploadGeoreference = new jQueryFileUploadMiddleware();
var uploadImage = new jQueryFileUploadMiddleware();

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
                },function(err) {
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
                    function(err) {
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

        var oldFileName = options.uploadDir() + '/' + fileInfo.name;
        var fileSrc = options.uploadDir() + '/' + path.basename(fileInfo.name, path.extname(fileInfo.name)).replace(/\s/g,'_').replace(/\W/g, '_')  + path.extname(fileInfo.name);

        fs.renameSync(oldFileName, fileSrc);

        fileInfo.name = path.basename(fileSrc);

        var fileDst = opts.dir + '/' + path.basename(fileInfo.name, path.extname(fileInfo.name)) + '.' + opts.extname;

        var cmd =  'convert '+fileSrc+' -resize "1500x1500" '+fileDst;

        console.log(cmd);
        exec(cmd, function (err, stdout, stderr) {
            if (err) throw err;

            console.log(stdout);
            console.log(stderr);

            console.log('Converted to jpeg');
            callback();
        });

    }
});

uploadImage.configure({
    uploadDir:filePaths.image.uploadDir,
    uploadUrl: filePaths.image.serverUrl,
    tmpDir:'/tmp',
    hostname: 'localhost:9000',
    imageTypes: /\.(gif|jpe?g|png|tif?f)$/i,
    imageVersions: {
        thumbnail: {
            width: 80,
            height: 80
        }
    },
    beforeProcessing: function(options,fileInfo,callback){
        console.log('pre process - file: '+fileInfo.name);

        var oldFileName = options.uploadDir() + '/' + fileInfo.name;
        var fileSrc = options.uploadDir() + '/tmp' + path.basename(fileInfo.name, path.extname(fileInfo.name)).replace(/\s/g,'_').replace(/\W/g, '_')  + path.extname(fileInfo.name);
        var newFileName = options.uploadDir() + '/' + path.basename(fileInfo.name, path.extname(fileInfo.name)).replace(/\s/g,'_').replace(/\W/g, '_')  + path.extname(fileInfo.name);

        fs.renameSync(oldFileName, fileSrc);

        fileInfo.name = path.basename(newFileName, path.extname(newFileName)) + '.jpg';

        var fileDst = options.uploadDir() + '/' + fileInfo.name;

        var cmd =  'convert '+fileSrc+' -resize "800x400" '+fileDst;

        console.log(cmd);
        exec(cmd, function (err, stdout, stderr) {
            if (err) throw err;

            console.log(stdout);
            console.log(stderr);

            console.log('Converted to jpeg');

            fs.unlink(fileSrc, function (err) {
                if (err) console.log('cant delete file ' + fileSrc);
            });

            callback();
        });

    }
});

var uploadImageFunc = function (req, res, next) {
    console.log(req.params.infoEinheit);
    console.log(req.params.feature);

    var folder = '/' + req.params.infoEinheit;
    if(req.params.feature) folder += '/' + req.params.feature;

    uploadImage.fileHandler({
        uploadDir: function () {
            return filePaths.image.uploadDir + folder;
        },
        uploadUrl: function () {
            return filePaths.image.serverUrl + folder;
        }
    })(req, res, next);
};

module.exports = {
    georeference: uploadGeoreference.fileHandler(),
    image: uploadImageFunc
};
