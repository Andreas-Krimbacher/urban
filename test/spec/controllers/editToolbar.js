'use strict';

describe('Controller: EditToolbarCtrl', function () {

  // load the controller's module
  beforeEach(module('swaApp'));

  var EditToolbarCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller) {
    scope = {};
    EditToolbarCtrl = $controller('EditToolbarCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
