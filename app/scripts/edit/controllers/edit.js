'use strict';

angular.module('udm.edit')
    .controller('EditCtrl', function ($scope,OpenLayersMap) {
        OpenLayersMap.resetMap();

        $scope.editView = 'lernEinheit';

        $scope.showFileUpload = function(type) {
            $scope.$broadcast('showFileUpload',type);
        };

        $scope.setFileUploadTarget = function(data) {
            $scope.$broadcast('setFileUploadTarget',data);
        };

        $scope.setMode = function(mode){
            OpenLayersMap.resetMap();

            if(mode == 'georef') OpenLayersMap.setNumZoomLevel(18);
            else OpenLayersMap.setNumZoomLevel(18);

            $scope.editView = mode;
        };

        $scope.showInfoEinheitInMap = function(data){
            $scope.$broadcast('showInfoEinheit',data);
        };

    });
