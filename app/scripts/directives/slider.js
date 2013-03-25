'use strict';

angular.module('swaApp')
  .directive('slider', [function () {
    return {
      template: '<div id="container"></div>{{value}}',
      restrict: 'E',
      link: function postLink(scope, element, attrs) {
          Ext.create('Ext.slider.Multi', {
              width: 200,
              values: [25, 75],
              increment: 5,
              minValue: 0,
              maxValue: 100,
              renderTo: 'container',
              listeners : {
                  change : function(slider, newValue){
                      scope.$apply(scope.value = newValue);
                  }
              }
          });
      }


    };
  }]);
