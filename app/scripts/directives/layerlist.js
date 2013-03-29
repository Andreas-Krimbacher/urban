'use strict';

angular.module('swaApp')
  .directive('layerlist', function () {
    return {
        templateUrl: '../views/layerlist.html',
      restrict: 'E',
      link: function postLink(scope, element, attrs) {

          var layer1 = {title : "Plan des Artistes",
                        opacity : 0.5}
          var layer2 = {title : "Plan des Artistes2",
              opacity : 0.5}
          var layer3 = {title : "Plan des Artistes3",
              opacity : 0.5}
          var layer4 = {title : "Plan des Artistes4",
              opacity : 0.5}

          scope.layers = [layer1,layer2,layer3,layer4]
      }
    };
  });
