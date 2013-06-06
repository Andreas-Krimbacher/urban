'use strict';
/**
 * Directive for a file upload dialog
 * @name Directive:fileupload
 * @namespace
 * @author Andreas Krimbacher
 */
angular.module('udm.fileUpload')
    .directive('fileupload', function ( $dialog, $rootScope) {
        return {
            templateUrl: '../views/fileUpload/fileUploadModal.html',
            restrict: 'E',
            scope:{
                /**
                 * name to identifie the dialog
                 * @name Directive:fileupload#name
                 * @type {string}
                 */
                name: '@'
            },
            link: function postLink(scope) {
                /**
                 * true if the dialog is initialized
                 * @name Directive:fileupload#initialized
                 * @type {boolean}
                 */
                var initialized = false;

                /**
                 * target url for the file upload
                 * @name Directive:fileupload#target
                 * @type {string}
                 */
                var target = false;

                /**
                 * set the target url for the file upload
                 * @name  Directive:fileupload#setFileUploadTarget
                 * @event
                 * @param value {object} {name:name,target:fileupload target}
                 */
                scope.$on('setFileUploadTarget', function(e,value) {
                    if(value.name != scope.name) return;

                    target = value.target;

                    if(initialized) setFileUpload();
                });

                /**
                 * show the file upload dialog
                 * @name  Directive:fileupload#showFileUpload
                 * @event
                 * @param value {string} name
                 */
                scope.$on('showFileUpload', function(e,value) {
                    if(value != scope.name) return;

                    if(!initialized && target != false) setFileUpload();

                    $('#fu-modal-' + scope.name).modal({
                        keyboard: false,
                        backdrop : 'static'
                    }).on('hidden', function () {
                        $rootScope.$broadcast('fileUploadFinished',scope.name);
                    }).modal('show');
                });

                /**
                 * close the file upload dialog
                 * @name  Directive:fileupload#close
                 * @function
                 */
                scope.close = function(){
                    $('#fu-modal-' + scope.name).modal('hide');
                };

                /**
                 * initialize the file upload dialog
                 * @name  Directive:fileupload#setFileUpload
                 * @function
                 */
                function setFileUpload(){
                    if(initialized) $('#fileupload-' + scope.name + ' table tbody tr.template-download').remove();

                    var element = $('#fileupload-' + scope.name);
                    // Initialize the jQuery File Upload widget:
                    element.fileupload({
                        // Uncomment the following to send cross-domain cookies:
                        //xhrFields: {withCredentials: true},
                        dataType: 'json',
                        url: 'http://localhost:9000/' + target,
                        acceptFileTypes: /(\.|\/)(gif|jpe?g|png|tif?f)$/i
                    });

                    // Load existing files:
                    $.ajax({
                        // Uncomment the following to send cross-domain cookies:
                        //xhrFields: {withCredentials: true},
                        url: element.fileupload('option', 'url'),
                        dataType: 'json',
                        context: element[0]
                    }).done(function (result) {
                            $(this).fileupload('option', 'done')
                                .call(this, null, {result: result});
                        });
                    initialized = true;
                }

            }
        };
    });
