'use strict';

angular.module('udm', ['ui','ngSanitize','udm.map','udm.openWorld','udm.edit'])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/edit', {
        templateUrl: 'views/edit.html',
        controller: 'EditCtrl'
      })
        .when('/open', {
            templateUrl: 'views/openWorld.html',
            controller: 'OpenWorldCtrl'
        })
      .otherwise({
        redirectTo: '/open'
      });
  });
