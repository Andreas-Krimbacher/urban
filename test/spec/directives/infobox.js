'use strict';

describe('Directive: infobox', function () {
  beforeEach(module('swaApp'));

  var element;

  it('should make hidden element visible', inject(function ($rootScope, $compile) {
    element = angular.element('<infobox></infobox>');
    element = $compile(element)($rootScope);
    expect(element.text()).toBe('this is the infobox directive');
  }));
});
