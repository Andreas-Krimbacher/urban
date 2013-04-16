'use strict';

angular.module('udm.infoElement')
    .directive('infoelement', function () {
        return {
            templateUrl: '../views/infoElement/infoElement.html',
            restrict: 'E',
            controller: 'InfoElementCtrl',
            link: function postLink(scope, element, attrs) {


            }
        };
    });
