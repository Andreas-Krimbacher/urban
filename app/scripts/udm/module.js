'use strict';

angular.module('udm', ['ngSanitize','udm.map','udm.openWorld','udm.edit','udm.lern'])
    .config(function ($routeProvider) {
        $routeProvider
            .when('/', {
                templateUrl: 'views/start.html',
                controller: 'StartCtrl'
            })
            .when('/edit', {
                templateUrl: 'views/edit.html',
                controller: 'EditCtrl'
            })
            .when('/world', {
                templateUrl: 'views/openWorld.html',
                controller: 'OpenWorldCtrl'
            })
            .when('/lern', {
                templateUrl: 'views/lern.html',
                controller: 'LernCtrl'
            })
            .otherwise({
                redirectTo: '/'
            });
    });
