'use strict';

angular.module('udm.edit')
    .controller('EditCtrl', function ($scope,OpenLayersMap) {
        OpenLayersMap.resetMap();

        $scope.editView = 'infoEinheit';

        $scope.showFileUpload = function(type) {
            $scope.$broadcast('showFileUpload',type);
        };

        $scope.setFileUploadTarget = function(data) {
            $scope.$broadcast('setFileUploadTarget',data);
        };

        $scope.setMode = function(mode){
            OpenLayersMap.resetMap();
            $scope.editView = mode;
        };

        $scope.showInfoEinheitInMap = function(data){
            $scope.$broadcast('showInfoEinheit',data);
        };

    });
