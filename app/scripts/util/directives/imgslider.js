'use strict';

angular.module('udm.util')
    .directive('imgslider', function () {
        return {
            templateUrl: '../views/util/imgslider.html',
            restrict: 'E',
            link: function postLink(scope) {

                var host = 'http://localhost:9000';

                scope.myInterval = 'false';
                scope.slides = [];

                scope.$on('setImg', function(e,value) {
                    scope.slides = [];

                    for(var img = 0; img < value.length; img++){
                        scope.slides.push({
                            image: host+ value[img]
                        });
                    }

                    if(!scope.$$phase) scope.$digest();
                });

                scope.close = function(){
                    scope.hideImageSlider();
                }

            }
        };
    });
