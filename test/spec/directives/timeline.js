'use strict';

describe('Directive: timeline', function () {
  beforeEach(module('swaApp'));

  var element;

  it('should make hidden element visible', inject(function ($rootScope, $compile) {
    element = angular.element('<timeline></timeline>');
    element = $compile(element)($rootScope);
    expect(element.text()).toBe('this is the timeline directive');
  }));
});
