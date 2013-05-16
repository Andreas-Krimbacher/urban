'use strict';

angular.module('udm.map')
  .controller('MapCtrl', function ($scope,$rootScope,OpenLayersMap) {
        OpenLayersMap.createMap('map');
        OpenLayersMap.setCenter(2.3408,48.8567,14);

        $rootScope.$on('$routeChangeSuccess', function (ev, data) {
            if(data.$$route){
                if(data.$$route.controller == 'OpenWorldCtrl') $scope.mapClass = 'withTimeline';
                if(data.$$route.controller == 'EditCtrl') $scope.mapClass = 'all';
                if(data.$$route.controller == 'LernCtrl') $scope.mapClass = 'withTimeline';
            }
        });

        $scope.$on('$clearMap', function (ev, data) {
            OpenLayersMap.resetMap();
        });

    });
