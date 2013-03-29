'use strict';

angular.module('swaApp', ['ui','ngSanitize'])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/mapView.html',
        controller: 'MapViewCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  });
