'use strict';
/**
 * Directive for the infobox
 * @name Directive:infobox
 * @namespace
 * @author Andreas Krimbacher
 */
angular.module('udm.util')
  .directive('infobox', function () {
    return {
      templateUrl: '../views/util/infobox.html',
      restrict: 'E',
      link: function postLink(scope) {

          /**
           * show information in the infobox
           * @name Directive:infobox#Event:showInfo
           * @function
           * @param info {object} {data: Info-Feature}
           */
          scope.$on('showInfo', function(e,info) {

              scope.info = info.data;
              if(scope.info.info == 'null') scope.info.info = '';
              if(scope.info.lernInfo == 'null') scope.info.lernInfo = false;

              if(!scope.$$phase) scope.$digest();
          });

          scope.info = {title : '',desc: ''};

          /**
           * show image gallery with the images in the scope
           * @name Directive:infobox#showImgSlider
           * @function
           */
          scope.showImgSlider = function(){
              if(scope.info.img.length == 0) return;
              scope.showImageSlider(scope.info.img);
          }
      }
    };
  });
