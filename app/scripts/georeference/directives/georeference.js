'use strict';

angular.module('udm.georeference')
  .directive('georeference', function () {
    return {
      templateUrl: '../views/georeference/georeference.html',
      restrict: 'E',
      controller: 'GeoreferenceCtrl',
      link: function postLink(scope, element, attrs) {



      }
    };
  });
