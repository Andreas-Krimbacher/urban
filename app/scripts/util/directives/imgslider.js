'use strict';

angular.module('udm.util')
    .directive('imgslider', function () {
        return {
            templateUrl: '../views/util/imgslider.html',
            restrict: 'E',
            link: function postLink(scope, element, attrs) {
                scope.images =  [{src:"/data/images/street.jpeg"},{src:"/data/images/arc.jpeg"},{src:"/data/images/head.jpeg"}];

                for(var img in scope.images){
                    $('#image-gallery-content').append('<article><img src="'+scope.images[img].src+'" /></article>');
                }

                $('.wmuSlider').wmuSlider({slideshow:false});

                $(".wmuSlider").bind('slideLoaded',function(e,data){
//                    alert(data);
                });


                scope.close = function(){
                    scope.setVisibilityImgSlider(false);
                }

            }
        };
    });
