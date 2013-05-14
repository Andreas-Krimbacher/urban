'use strict';

angular.module('udm')
  .controller('MainCtrl', function ($scope,$location,$route) {
        $scope.setRoute = function(path){
            $location.path(path);
            $route.reload();
        }
  });
