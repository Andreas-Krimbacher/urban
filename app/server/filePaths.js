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
    },
    tiles:{
        baseDir : fileServerPath + '/tilesData',
        tiffDir : fileServerPath + '/tilesData/tiff',
        thumbDir : fileServerPath + '/tilesData/thumbnail'
    },
    image:{
        uploadDir : fileServerPath + '/imgData',
        thumbDir : fileServerPath + '/imgData/thumbnail',

        serverUrl : '/imgData',
        serverThumbUrl : '/imgData/thumbnail'
    }
}