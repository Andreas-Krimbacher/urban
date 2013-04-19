var fileServerPath = '/home/nd/ooo/Urban/FileServer';

module.exports = {
    georeference:{
        uploadDir : fileServerPath + '/georeferenceData',
        jpegDir : fileServerPath + '/georeferenceData/jpeg',
        tiffDir : fileServerPath + '/georeferenceData/tiff',
        thumbDir : fileServerPath + '/georeferenceData/thumbnail',

        tilesDir : fileServerPath + '/georeferenceData/tiles',

        serverUrl : '/georeferenceData',
        serverJpegUrl : '/georeferenceData/jpeg',
        serverTiffUrl : '/georeferenceData/tiff',
        serverThumbUrl : '/georeferenceData/thumbnail'
    }
}