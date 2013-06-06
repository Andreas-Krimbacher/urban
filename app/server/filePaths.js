/**
 * Server module to manage file paths
 * @name Server:filePaths
 * @namespace
 * @author Andreas Krimbacher
 */

var fileServerPath = '/home/nd/ooo/Urban/FileServer';

module.exports = {
    georeference:{
		/**
         * upload directory for georeferencing
         * @name Server:filePaths#georeference:uploadDir
         * @type {string}
         */
        uploadDir : fileServerPath + '/georeferenceData',
		/**
         * jpeg directory for georeferencing
         * @name Server:filePaths#georeference:jpegDir
         * @type {string}
         */
        jpegDir : fileServerPath + '/georeferenceData/jpeg',
		/**
         * tiff directory for georeferencing
         * @name Server:filePaths#georeference:tiffDir
         * @type {string}
         */
        tiffDir : fileServerPath + '/georeferenceData/tiff',
		/**
         * thumbnail directory for georeferencing
         * @name Server:filePaths#georeference:thumbDir
         * @type {string}
         */
        thumbDir : fileServerPath + '/georeferenceData/thumbnail',

		/**
         * tiles directory for georeferencing
         * @name Server:filePaths#georeference:tilesDir
         * @type {string}
         */
        tilesDir : fileServerPath + '/georeferenceData/tiles',

		/**
         * server path to gereferncing upload directory
         * @name Server:filePaths#georeference:serverUrl
         * @type {string}
         */
        serverUrl : '/georeferenceData',
		/**
         * server path to gereferncing jpeg directory
         * @name Server:filePaths#georeference:serverJpegUrl
         * @type {string}
         */
        serverJpegUrl : '/georeferenceData/jpeg',
		/**
         * server path to gereferncing tiff directory
         * @name Server:filePaths#georeference:serverTiffUrl
         * @type {string}
         */
        serverTiffUrl : '/georeferenceData/tiff',
		/**
         * server path to gereferncing thumbnail directory
         * @name Server:filePaths#georeference:serverThumbUrl
         * @type {string}
         */
        serverThumbUrl : '/georeferenceData/thumbnail'
    },
    tiles:{
		/**
         * base tiles directory
         * @name Server:filePaths#tiles:baseDir
         * @type {string}
         */
        baseDir : fileServerPath + '/tilesData',
		/**
         * tiff directory of the tiles directory
         * @name Server:filePaths#tiles:baseDir
         * @type {string}
         */
        tiffDir : fileServerPath + '/tilesData/tiff',
		/**
         * thumbnail directory of the tiles directory
         * @name Server:filePaths#tiles:baseDir
         * @type {string}
         */
        thumbDir : fileServerPath + '/tilesData/thumbnail'
    },
    image:{
		/**
         * upload directory for images
         * @name Server:filePaths#image:uploadDir
         * @type {string}
         */
        uploadDir : fileServerPath + '/imgData',
		/**
         * thumbnail directory for images
         * @name Server:filePaths#image:thumbDir
         * @type {string}
         */
        thumbDir : fileServerPath + '/imgData/thumbnail',

		/**
         * server path of directory for image upload
         * @name Server:filePaths#image:serverUrl
         * @type {string}
         */
        serverUrl : '/imgData',
		/**
         * server path of directory for image upload thumbnails
         * @name Server:filePaths#image:serverThumbUrl
         * @type {string}
         */
        serverThumbUrl : '/imgData/thumbnail'
    }
};