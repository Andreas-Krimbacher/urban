'use strict';
/**
 * Directive for the image gallery
 * @name Directive:imgslider
 * @namespace
 * @author Andreas Krimbacher
 */
angular.module('udm.util')
    .directive('imgslider', function () {
        return {
            templateUrl: '../views/util/imgslider.html',
            restrict: 'E',
            link: function postLink(scope) {

                /**
                 * Serverhost
                 * @name Directive:imgslider#host
                 * @type {string}
                 */
                var host = 'http://localhost:9000';

                scope.myInterval = 'false';

                /**
                 * Image slides
                 * @name Directive:imgslider#slides
                 * @type {Array(slides)}
                 */
                scope.slides = [];

                /**
                 * shows the image gallery with the passed images
                 * @name Directive:imgslider#Event:setImg
                 * @function
                 * @param value {Array(string)} img paths
                 */
                scope.$on('setImg', function(e,value) {
                    scope.slides = [];

                    for(var img = 0; img < value.length; img++){
                        scope.slides.push({
                            image: host+ value[img]
                        });
                    }

                    if(!scope.$$phase) scope.$digest();
                });

                /**
                 * Hide the image gallery
                 * @name Directive:imgslider#close
                 * @function
                 */
                scope.close = function(){
                    scope.hideImageSlider();
                }

            }
        };
    });
