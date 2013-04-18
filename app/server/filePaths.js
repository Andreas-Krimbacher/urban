var fileServerPath = '/home/nd/ooo/Urban/FileServer';

module.exports = {
    fileServerFolder : fileServerPath,

    uploadBaseFolder : fileServerPath + '/uploadData',
    uploadJpegFolder : fileServerPath + '/uploadData/jpeg',
    uploadTiffFolder : fileServerPath + '/uploadData/tiff',
    uploadUpFolder : fileServerPath + '/uploadData/upload',
    uploadThumbFolder : fileServerPath + '/uploadData/thumbnail',
    uploadTmpFolder : fileServerPath + '/uploadData/tmp',

    rasterFolder : fileServerPath + '/rasterData',
    rasterTmpFolder : fileServerPath + '/rasterData/tmp',

    tilesFolder : fileServerPath + '/tilesData',
    tilesTmpFolder : fileServerPath + '/tilesData/tmp',

    jpegServer : '/uploadData/jpeg',
    imgServer : '/uploadData'
}