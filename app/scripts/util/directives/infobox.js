'use strict';

angular.module('udm.util')
  .directive('infobox', function () {
    return {
      templateUrl: '../views/util/infobox.html',
      restrict: 'E',
      link: function postLink(scope, element, attrs) {

          scope.$on('showInfo', function(e,info) {


              scope.info = info.data;
              if(scope.info.info == 'null') scope.info.info = '';

              scope.editMode = info.editMode;

              if(!scope.$$phase) scope.$digest();

          });

          scope.info = {title : '',desc: ''};

          scope.showImgSlider = function(){
              if(scope.info.img.length == 0) return;
              scope.showImageSlider(scope.info.img);
          }
      }
    };
  });
