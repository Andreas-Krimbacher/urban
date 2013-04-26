'use strict';

angular.module('udm.util')
  .directive('infobox', function () {
    return {
      templateUrl: '../views/util/infobox.html',
      restrict: 'E',
      link: function postLink(scope, element, attrs) {

          scope.$on('showInfo', function(e,value) {
              scope.info.title = value.title;
              if(value.info = 'null') value.info = '';
              scope.info.desc = value.info;
              scope.info.end = value.end;
              scope.info.start = value.start;

              if(!scope.$$phase) scope.$digest();

          });

          scope.info = {title : '',
                            desc: ''}

          scope.showImgSlider = function(){
              scope.setVisibilityImgSlider(true);
          }
      }
    };
  });
