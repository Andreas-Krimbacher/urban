'use strict';

angular.module('udm.edit')
    .controller('EditCtrl', function ($scope,$dialog,georeference) {
        $scope.editView = 'infoEinheit'

        $scope.showRasterImgUpload = function() {
            $scope.$broadcast('showRasterImgUpload');
        };

        $scope.fileUploadFinished = function(){
            $scope.$broadcast('fileUploadFinished');
        }

        $scope.setMode = function(mode){
            if($scope.editView == 'georef') $scope.$broadcast('clearGeoref');

            $scope.editView = mode;
        }

    });
