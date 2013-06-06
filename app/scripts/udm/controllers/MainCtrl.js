'use strict';
/**
 * The main controller, adujusts the map view and info window
 * @name Controller:MainCtrl
 * @namespace
 * @author Andreas Krimbacher
 */
angular.module('udm')
  .controller('MainCtrl', function ($scope,$location,$route,OpenLayersMap) {
        /**
         * sets the route of the application, to sqitch between the three main views
         * @name Controller:MainCtrl#setRoute
         * @function
         * @param path {string} new route
         */
        $scope.setRoute = function(path){
            //set maximum map zoom to 18
            OpenLayersMap.setMaxZoomLevel(18);

            if($location.path() == path) $route.reload();
            else{
                if(!$scope.$$phase) $scope.$apply($location.path(path));
                else $location.path(path);
            }

        };

        /**
         * set the map to the initial position
         * @name Controller:MainCtrl#home
         * @function
         */
        $scope.home = function(){
            OpenLayersMap.setCenter(2.3408,48.8567,14);
        };

        /**
         * show the info window
         * @name Controller:MainCtrl#showInfo
         * @function
         */
        $scope.showInfo = function(){
            $('#info').modal();
        };

        /**
         * hide the info windoe
         * @name Controller:MainCtrl#closeInfo
         * @function
         */
        $scope.closeInfo = function(){
            $('#info').modal('hide');
        };


        //add tooltips
        $('#topWorld').powerTip({placement:'s'});
        $('#topLern').powerTip({placement:'s'});
        $('#topQuestion').powerTip({placement:'s'});

    });
