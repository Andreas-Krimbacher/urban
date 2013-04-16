'use strict';

angular.module('udm', ['ui','ui.bootstrap.dropdownToggle','ngSanitize','udm.map','udm.infoElement','udm.timeline','udm.georeference'])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/openWorld.html',
        controller: 'OpenWorldCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  });
