'use strict';

angular.module('udm.map')
  .controller('MapCtrl', function ($scope,map,layers) {
        map.createMap('map');
        map.setCenter(2.3408,48.8567,14);

    });
