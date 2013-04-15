'use strict';
//var lrSnippet = require('grunt-contrib-livereload/lib/utils').livereloadSnippet;
//var proxySnippet = require('grunt-connect-proxy/lib/utils').proxyRequest;
//var mountFolder = function (connect, dir) {
//  return connect.static(require('path').resolve(dir));
//};

var imgDirGeoserver = '/usr/share/opengeo-suite-data/geoserver_data/data/urban';

var path = require('path');

module.exports = function (grunt) {
    // load all grunt tasks
    require('matchdep').filterDev('grunt-*').concat(['gruntacular']).forEach(grunt.loadNpmTasks);

    // configurable paths
    var yeomanConfig = {
        app: 'app',
        dist: 'dist'
    };

    try {
        yeomanConfig.app = require('./component.json').appPath || yeomanConfig.app;
    } catch (e) {}

    grunt.initConfig({
        yeoman: yeomanConfig,
        livereload: {
            port: 35729
        },
        watch: {
            compass: {
                files: ['<%= yeoman.app %>/styles/{,*/}*.{scss,sass}'],
                tasks: ['compass']
            },
            livereload: {
                files: [
                    '<%= yeoman.app %>/{,*/}*.html',
                    '{.tmp,<%= yeoman.app %>}/styles/{,*/}*.css',
                    '{.tmp,<%= yeoman.app %>}/view/{,*/}*.html',
                    '{.tmp,<%= yeoman.app %>}/scripts/{,*/}*.js',
                    '<%= yeoman.app %>/images/{,*/}*.{png,jpg,jpeg}'
                ],
                tasks: ['livereload']
            }
        },
//    connect: {
//      proxies: [
//            {
//                context: '/geoserver',
//                host: 'localhost',
//                port: 8080,
//                https: false,
//                changeOrigin: false
//            }
//      ],
//      livereload: {
//        options: {
//          port: 9000,
//          // Change this to '0.0.0.0' to access the server from outside.
//          hostname: 'localhost',
//          bases: [yeomanConfig.app],
//          middleware: function (connect,options) {
//            return [
//              proxySnippet,
//              lrSnippet,
//              mountFolder(connect, '.tmp'),
//              mountFolder(connect, yeomanConfig.app)
//            ];
//          }
//        }
//      }
//      test: {
//        options: {
//          port: 9000,
//          middleware: function (connect) {
//            return [
//              mountFolder(connect, '.tmp'),
//              mountFolder(connect, 'test')
//            ];
//          }
//        }
//      }
//    },
        express: {
            livereload: {
                options: {
                    port: 9000,
                    // Change this to '0.0.0.0' to access the server from outside.
                    hostname: 'localhost',
                    bases: [yeomanConfig.app,'.tmp',imgDirGeoserver],
                    server: path.resolve('app/server/server.js'),
                    watchChanges: true,
                    //debug:true
                }
            }
        },
        open: {
            server: {
                url: 'http://localhost:<%= express.livereload.options.port %>'
            }
        },
        clean: {
            server: '.tmp'
        },
        testacular: {
            unit: {
                configFile: 'testacular.conf.js',
                singleRun: true
            }
        },
        compass: {
            options: {
                sassDir: '<%= yeoman.app %>/styles',
                cssDir: '.tmp/styles',
                imagesDir: '<%= yeoman.app %>/styles/images',
                javascriptsDir: '<%= yeoman.app %>/scripts',
                fontsDir: '<%= yeoman.app %>/styles/fonts',
                importPath: '<%= yeoman.app %>/components',
                relativeAssets: true
            },
            dist: {},
            server: {
                options: {
                    debugInfo: true
                }
            }
        }
    });

    grunt.renameTask('regarde', 'watch');
    // remove when mincss task is renamed
    grunt.renameTask('mincss', 'cssmin');

    grunt.registerTask('server', [
//    'clean:server',
        'compass:server',
        'configureProxies',
        'livereload-start',
        'express:livereload',
        'open',
        'watch'
    ]);

    grunt.registerTask('test', [
        'clean:server',
        'compass',
        'express:test',
        'testacular'
    ]);

//  grunt.registerTask('build', [
//    'clean:dist',
//    'jshint',
//    'test',
//    'compass:dist',
//    'useminPrepare',
//    'imagemin',
//    'cssmin',
//    'htmlmin',
//    'concat',
//    'copy',
//    'cdnify',
//    'usemin',
//    'ngmin',
//    'uglify'
//  ]);

    grunt.registerTask('default', ['server']);
};
