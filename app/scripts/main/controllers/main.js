'use strict';

angular.module('udm')
  .controller('MainCtrl', function ($scope,$location,$route,OpenLayersMap) {
        $scope.setRoute = function(path){
            OpenLayersMap.setNumZoomLevel(18);
            $location.path(path);
            $route.reload();
        };

        $scope.home = function(){
            OpenLayersMap.setCenter(2.3408,48.8567,14);
        };


        $('#topWorld').powerTip({placement:'s'});
        $('#topLern').powerTip({placement:'s'});
        $('#topEdit').powerTip({placement:'s'});

    });
