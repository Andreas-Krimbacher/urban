'use strict';

angular.module('swaApp')
  .directive('layerswitcher', function () {
    return {
      template: '<div></div>',
      restrict: 'E',
      link: function postLink(scope, element, attrs) {
        element.text('this is the layerswitcher directive');
      }
    };
  });
