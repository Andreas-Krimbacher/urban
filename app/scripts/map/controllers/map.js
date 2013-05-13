'use strict';

angular.module('udm.map')
  .controller('MapCtrl', function ($scope,$rootScope,OpenLayersMap,layers) {
        OpenLayersMap.createMap('map');
        OpenLayersMap.setCenter(2.3408,48.8567,14);

        $rootScope.$on('$routeChangeSuccess', function (ev, data) {
            if(data.$route) $scope.mapClass = data.$route.mapClass;
        });

    });
