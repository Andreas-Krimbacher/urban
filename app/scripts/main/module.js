'use strict';

angular.module('udm', ['ui','ui.bootstrap.dropdownToggle','ngSanitize','udm.map','udm.infoElement','udm.timeline','udm.edit'])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/edit.html',
        controller: 'EditCtrl'
      })
        .when('/open', {
            templateUrl: 'views/openWorld.html',
            controller: 'OpenWorldCtrl'
        })
      .otherwise({
        redirectTo: '/'
      });
  });
