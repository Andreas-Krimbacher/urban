'use strict';

angular.module('udm.edit')
    .controller('EditCtrl', function ($scope,$dialog,georeference) {
        $scope.editView = 'lernEinheit';

        $scope.showFileUpload = function(type) {
            $scope.$broadcast('showFileUpload',type);
        };

        $scope.setFileUploadTarget = function(data) {
            $scope.$broadcast('setFileUploadTarget',data);
        };

        $scope.setMode = function(mode){
		georeference.fetchMap();
            if($scope.editView == 'georef') $scope.$broadcast('clearGeoref');

            $scope.editView = mode;
        }

    });
