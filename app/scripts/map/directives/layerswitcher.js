'use strict';

angular.module('udm.map')
  .directive('layerswitcher', function (map,$compile) {
    return {
      templateUrl: '../views/map/layerswitcher.html',
      restrict: 'E',
      link: function postLink(scope, element, attrs) {
          scope.basemaps = map.getBasemaps();

          scope.setBasemap = function(id){
              map.setBasemap(id);
              scope.basemaps = map.getBasemaps();
          }

      }
    };
  });
