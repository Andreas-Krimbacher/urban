'use strict';

angular.module('swaApp')
  .filter('id', function () {
    return function (value,settings) {
      if(value) return value;
      return '--';
    };
  });
