'use strict';

angular.module('udm.edit')
    .controller('EditCtrl', function ($scope,$dialog) {
        $scope.editView = 'georef'

        $scope.showRasterImgUpload = function() {
            $scope.$broadcast('showRasterImgUpload');
        };

    });
