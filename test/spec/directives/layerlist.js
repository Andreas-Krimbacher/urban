'use strict';

describe('Directive: layerlist', function () {
  beforeEach(module('swaApp'));

  var element;

  it('should make hidden element visible', inject(function ($rootScope, $compile) {
    element = angular.element('<layerlist></layerlist>');
    element = $compile(element)($rootScope);
    expect(element.text()).toBe('this is the layerlist directive');
  }));
});
