'use strict';

describe('Directive: layerswitcher', function () {
  beforeEach(module('swaApp'));

  var element;

  it('should make hidden element visible', inject(function ($rootScope, $compile) {
    element = angular.element('<layerswitcher></layerswitcher>');
    element = $compile(element)($rootScope);
    expect(element.text()).toBe('this is the layerswitcher directive');
  }));
});
