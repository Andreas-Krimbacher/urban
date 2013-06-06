'use strict';
/**
 * Controller for the openlayers map, used by the map directive and uses the OpenLayersMap service
 * @name Controller:MapCtrl
 * @namespace
 * @author Andreas Krimbacher
 */
angular.module('udm.map')
  .controller('MapCtrl', function ($scope,$rootScope,OpenLayersMap) {

        //create a map with the OpenLayersMap service
        OpenLayersMap.createMap('map');
        OpenLayersMap.setCenter(2.3408,48.8567,14);

        /**
         * adjust the copyright label from google maps for the different views, the event is called by angularjs on route change
         * @name  Controller:MapCtrl#$routeChangeSuccess
         * @event
         * @param data {object} route object
         */
        $rootScope.$on('$routeChangeSuccess', function (ev, data) {
            if(data.$$route){
                if(data.$$route.controller == 'EditCtrl'){
                    $('.olLayerGoogleCopyright').css('bottom','0px');
                }
                else{
                    $('.olLayerGoogleCopyright').css('bottom','100px');
                }
            }
        });

        /**
         * reset the map
         * @name  Controller:MapCtrl#$clearMap
         * @event
         */
        $scope.$on('$clearMap', function () {
            OpenLayersMap.resetMap();
        });

    });
