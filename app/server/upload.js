var filePaths = require('./filePaths');

//Upload
var upload = require('jquery-file-upload-middleware');
// configure upload middleware
var _baseDir = '/usr/share/opengeo-suite-data/geoserver_data/data/urban/imgServer';

upload.configure({
    uploadDir:filePaths.uploadUpFolder,
    tiffDir: filePaths.uploadTiffFolder,
    jpegDir: filePaths.uploadJpegFolder,
    uploadUrl: filePaths.imgServer,
    tmpDir:filePaths.uploadTmpFolder,
    thumbnailDir:  filePaths.uploadThumbFolder,
    hostname: 'localhost:9000',
    imageVersions: {
        thumbnail: {
            width: 80,
            height: 80,
            quality: 'auto'
        }
    }
});

module.exports = upload.fileHandler()
