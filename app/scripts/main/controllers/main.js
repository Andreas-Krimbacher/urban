'use strict';

angular.module('udm')
  .controller('MainCtrl', function ($scope,$location,$route,OpenLayersMap) {
        $scope.setRoute = function(path){
            OpenLayersMap.setMaxZoomLevel(18);

            if($location.path() == path) $route.reload();
            else{
                if(!$scope.$$phase) $scope.$apply($location.path(path));
                else $location.path(path);
            }

        };

        $scope.home = function(){
            OpenLayersMap.setCenter(2.3408,48.8567,14);
        };

        $scope.showInfo = function(){
            $('#info').modal();
        };

        $scope.closeInfo = function(){
            $('#info').modal('hide');
        };


        $('#topWorld').powerTip({placement:'s'});
        $('#topLern').powerTip({placement:'s'});
        $('#topEdit').powerTip({placement:'s'});

    });
