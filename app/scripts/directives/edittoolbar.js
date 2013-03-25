'use strict';

angular.module('swaApp')
  .directive('edittoolbar', function () {
        return {
            templateUrl: '../views/editToolbar.html',
            restrict: 'E',
            controller: function($scope, $attrs, layers, map, settings, util) {

                $scope.controls = {
                    drawPoint :  map.getDrawControl('Point',layers.getPointLayer()),
                    drawLine  :  map.getDrawControl('Line',layers.getLineLayer()),
                    drawPoly  :  map.getDrawControl('Poly',layers.getPolyLayer()),
                    edit : map.getEditControl(layers.getLayers()),
                    del : map.getDeleteControl(layers.getLayers())
                };

                $scope.save = function() {
                    for(var x in $scope.controls){
                        if($scope.status[x]){
                            $scope.controls[x].deactivate();
                            $scope.status[x] = false;
                        }
                    }
                    layers.saveLayers();
                }

                $scope.attributes = null;
                $scope.$on('showAttributes', function(event, feature) {
                    // assign the loaded track as the 'current'
                        if(!$scope.$$phase) {
                            $scope.$apply(function () {
                                $scope.feature = feature;
                                $scope.attributes = feature.attributes;
                            });
                        }
                });

                $scope.setFeatureUpdate = function(){
                    //$scope.feature.state = "Update";
                };

                $scope.$on('hideAttributes', function(event, attributes) {
                    // assign the loaded track as the 'current'
                        if(!$scope.$$phase) {
                            $scope.$apply(function () {
                                $scope.attributes = null;
                            });
                        }
                });

                $scope.$on('featureadded', function(event, attributes) {
                    if(!$scope.$$phase) $scope.$digest();
                });

                $scope.attributesSettings = settings.getAttributes();

                $scope.features = {points : layers.getPointFeatures(),
                    lines : layers.getLineFeatures(),
                    polys : layers.getPolyFeatures()}


            },
            link: function postLink($scope, element) {




                $scope.status = {
                    drawPoint : false,
                    drawLine : false,
                    drawPoly : false,
                    edit : false,
                    del : false
                };


                $scope.setControl = function(type,state){
                    for(var x in $scope.controls){
                        $scope.controls[x].deactivate();
                        $scope.status[x] = false;
                    }
                    if(state){
                        $scope.controls[type].activate();
                        $scope.status[type] = true;
                    }
                };

                //save function in controller



            }
        };
  });
