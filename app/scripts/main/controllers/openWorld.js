'use strict';

angular.module('udm')
  .controller('OpenWorldCtrl', function ($scope,map,layers) {
        $scope.showInfoElement = function(infoElement) {
            $scope.$broadcast('showInfoElement',infoElement);
        };

    });
