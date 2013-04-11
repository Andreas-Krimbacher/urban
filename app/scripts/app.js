'use strict';

angular.module('swaApp', ['ui','ui.bootstrap.dropdownToggle','ngSanitize'])
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
