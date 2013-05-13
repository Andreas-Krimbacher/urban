'use strict';

angular.module('udm.util')
    .directive('imgslider', function () {
        return {
            templateUrl: '../views/util/imgslider.html',
            restrict: 'E',
            link: function postLink(scope, element, attrs) {

                scope.$on('setImg', function(e,value) {
                    $('.wmuSlider').html('<div class="wmuSliderWrapper" id="image-gallery-content"></div>');
                    for(var img in value){
                        $('#image-gallery-content').append('<article><img src="'+value[img]+'" /></article>');
                    }
                    $('.wmuSlider').wmuSlider({slideshow:false});
                });
                //$('#image-gallery-content').append('<article><img src="/imgData/2/sdf.png" /></article>');


                scope.close = function(){
                    scope.hideImageSlider(false);
                }

            }
        };
    });
