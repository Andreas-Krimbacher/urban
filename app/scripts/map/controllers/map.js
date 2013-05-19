'use strict';

angular.module('udm.map')
  .controller('MapCtrl', function ($scope,$rootScope,OpenLayersMap) {
        OpenLayersMap.createMap('map');
        OpenLayersMap.setCenter(2.3408,48.8567,14);

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

        $scope.$on('$clearMap', function () {
            OpenLayersMap.resetMap();
        });

    });
