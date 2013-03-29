'use strict';

angular.module('swaApp')
  .directive('infobox', function () {
    return {
      templateUrl: '../views/infobox.html',
      restrict: 'E',
      link: function postLink(scope, element, attrs) {
            scope.info = {title : "Plan des Artistes",
                            desc: "bla bla bla bla bla blabla bla blabla bla bja ja jalabja ja jabja ja jabja ja jabja ja jabja ja jabja ja jabja ja jabja ja jabja ja jabja ja jabja ja jabja ja jabja ja jabla bla blabla bla blabla bla blabla bla blabla bla blabla bla blabla bla blabla bla blabla bla blabla bla blabla bla blabla bla blabla bla blabla bla blabla bla blabla bla blabla bla blabla bla blabla bla blabla bla blabla bla blabla bla blabla bla blabla bla blabla bla blabla bla blabla bla blabla bla blabla bla blabla bla blabla bla blabla bla blabla bla blabla bla blabla bla blabla bla blabla bla blabla bla blabla bla blabla bla blabla bla blabla bla blabla bla blabla bla blabla bla blabla bla blabla bla blabla bla blabla bla blabla bla blabla bla blabla bla blabla bla blabla bla blabla bla blabla bla blabla bla bla",
                           deepLink : "sds"}
      }
    };
  });
