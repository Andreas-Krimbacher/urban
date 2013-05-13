'use strict';

describe('Directive: editToolbar', function () {
  beforeEach(module('swaApp'));

  var element;

  it('should make hidden element visible', inject(function ($rootScope, $compile) {
    element = angular.element('<edit-toolbar></edit-toolbar>');
    element = $compile(element)($rootScope);
    expect(element.text()).toBe('this is the editToolbar directive');
  }));
});
