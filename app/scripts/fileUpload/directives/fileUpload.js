'use strict';

angular.module('udm.fileUpload')
    .directive('fileupload', function ( $dialog) {
        return {
            templateUrl: '../views/fileUpload/fileUploadModal.html',
            restrict: 'E',
            link: function postLink(scope, element, attrs) {

                scope.$on('showRasterImgUpload', function(e,value) {
                    $('#myModal').modal({
                        keyboard: false,
                        backdrop : 'static'
                    })
                    $('#myModal').on('hidden', function () {
                        scope.fileUploadFinished();
                    })
                    $('#myModal').modal('show');
                });

                scope.close = function(){
                    $('#myModal').modal('hide');
                }

                setUpFileUpload();

                function setUpFileUpload(){
                    // Initialize the jQuery File Upload widget:
                    $('#fileupload').fileupload({
                        // Uncomment the following to send cross-domain cookies:
                        //xhrFields: {withCredentials: true},
                        dataType: 'json',
                        url: 'http://localhost:9000/georeferenceUpload',
                        acceptFileTypes: /(\.|\/)(gif|jpe?g|png|tif?f)$/i
                    });

                    // Load existing files:
                    $.ajax({
                        // Uncomment the following to send cross-domain cookies:
                        //xhrFields: {withCredentials: true},
                        url: $('#fileupload').fileupload('option', 'url'),
                        dataType: 'json',
                        context: $('#fileupload')[0]
                    }).done(function (result) {
                            $(this).fileupload('option', 'done')
                                .call(this, null, {result: result});
                        });
                }

            }
        };
    });
