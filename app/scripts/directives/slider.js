'use strict';

angular.module('swaApp')
  .directive('slider', [function () {
    return {
      template: '<div class="slider"></div>',
      restrict: 'E',
      link: function postLink(scope, element, attrs) {
          $( ".slider" ).slider({
              min: 0,
              max: 360,
              step: 5,
              value: 100,
              slide: function( event, ui ) {
                  scope.$emit('sliderChanged',ui.value);
          }
          });
      }
    };
  }]);
