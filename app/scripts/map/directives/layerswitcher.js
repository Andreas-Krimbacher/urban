'use strict';
/**
 * Directive for basemap switcher
 * @name Directive:layerswitcher
 * @namespace
 * @author Andreas Krimbacher
 */
angular.module('udm.map')
  .directive('layerswitcher', function (OpenLayersMap) {
    return {
      templateUrl: '../views/map/layerswitcher.html',
      restrict: 'E',
      link: function postLink(scope) {
          /**
           * Basemaps from the OpenLayersMap service
           * @name Directive:layerswitcher#basemaps
           * @type {object}
           */
          scope.basemaps = OpenLayersMap.getBasemaps();

          /**
           * sets the basemap in the  OpenLayersMap service
           * @name Directive:layerswitcher#setBasemap
           * @function
           * @param id {string} basemap id
           */
          scope.setBasemap = function(id){
              OpenLayersMap.setBasemap(id);
              scope.basemaps = OpenLayersMap.getBasemaps();
          }

      }
    };
  });
