'use strict';

angular.module('udm.util')
  .directive('infobox', function () {
    return {
      templateUrl: '../views/util/infobox.html',
      restrict: 'E',
      link: function postLink(scope) {

          scope.$on('showInfo', function(e,info) {

              scope.info = info.data;
              if(scope.info.info == 'null') scope.info.info = '';
              if(scope.info.lernInfo == 'null') scope.info.lernInfo = false;
              scope.editMode = info.mode;

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
