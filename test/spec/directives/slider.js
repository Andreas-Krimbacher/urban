'use strict';

describe('Directive: slider', function () {
  beforeEach(module('swaApp'));

  var element;

  it('should make hidden element visible', inject(function ($rootScope, $compile) {
    element = angular.element('<slider></slider>');
    element = $compile(element)($rootScope);
    expect(element.text()).toBe('this is the slider directive');
  }));
});
