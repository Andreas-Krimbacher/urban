'use strict';

angular.module('udm.map')
  .directive('layerswitcher', function (OpenLayersMap,$compile) {
    return {
      templateUrl: '../views/map/layerswitcher.html',
      restrict: 'E',
      link: function postLink(scope, element, attrs) {
          scope.basemaps = OpenLayersMap.getBasemaps();

          scope.setBasemap = function(id){
              OpenLayersMap.setBasemap(id);
              scope.basemaps = OpenLayersMap.getBasemaps();
          }

      }
    };
  });
