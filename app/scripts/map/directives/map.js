'use strict';

angular.module('udm.map')
  .directive('map', function (map,$compile) {
    return {
      template: '<div id="map"></div><layerswitcher></layerswitcher>',
      restrict: 'E',
      controller: 'MapCtrl',
      link: function postLink(scope, element, attrs) {
          scope.basemaps = map.getBasemaps();

          scope.setBasemap = function(id){
              map.setBasemap(id);
              scope.basemaps = map.getBasemaps();
          }

      }
    };
  });
