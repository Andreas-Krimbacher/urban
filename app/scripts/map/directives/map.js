'use strict';

angular.module('udm.map')
  .directive('map', function (OpenLayersMap) {
    return {
      template: '<div id="map" class="{{mapClass}}"></div><layerswitcher></layerswitcher>',
      restrict: 'E',
      controller: 'MapCtrl',
      link: function postLink(scope) {
          scope.basemaps = OpenLayersMap.getBasemaps();

      }
    };
  });
