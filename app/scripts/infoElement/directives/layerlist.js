'use strict';

angular.module('udm.infoElement')
  .directive('layerlist', function () {
    return {
        templateUrl: '../views/infoElement/layerlist.html',
      restrict: 'E',
      link: function postLink(scope, element, attrs) {

          scope.$on('showLayerInList', function(e,value) {
              scope.layers = [{title : value.name}];
          });

          scope.layers = []
      }
    };
  });
