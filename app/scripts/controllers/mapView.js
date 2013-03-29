'use strict';

angular.module('swaApp')
  .controller('MapViewCtrl', function ($scope,map,layers) {
        map.createMap('map');
        map.setCenter(-71.147, 48.472,8);

//        map.addLayers(layers.getLayers());

    });
