'use strict';

angular.module('udm.util')
    .directive('layerlist', function () {
        return {
            templateUrl: '../views/util/layerlist.html',
            restrict: 'E',
            link: function postLink(scope, element, attrs) {

                scope.layers = [];
                scope.selectedId = null;

                scope.editMode = false;

                scope.selectItem = function(infoEinheit,feature){
                    scope.selectedId = feature;
                    for(var x in scope.layers){
                        if(scope.layers[x].id == infoEinheit){
                            for(var y in scope.layers[x].features){
                                if(scope.layers[x].features[y].id == feature){
                                    if(scope.layers[x].features[y].typ == 'plan') scope.$emit('showInfoPlan',scope.layers[x]);
                                    else scope.$emit('showInfoPlan',scope.layers[x].features[y]);
                                    return;
                                }
                            }
                        }
                    }
                };

                scope.$on('showLayerInList', function(e,data) {
                    var infoEinheit = data.infoEinheit;
                    scope.editMode = data.editMode;

                    scope.layers.splice(0,0,infoEinheit);
                    if(infoEinheit.baseLayer.id) scope.selectedId = infoEinheit.baseLayer.id;
                    else{
                        for(var x in infoEinheit.features){
                            scope.selectedId = infoEinheit.features[x].id;
                            break;
                        }
                    }

                    if(data.onlyBase) scope.toogleFeatureLayer(0);
                });

                scope.$on('selectItem', function(e,id) {
                    if(id.type == 'infoEinheit'){
                        var idFound = false;
                        for(var x in scope.layers){
                            if(scope.layers[x].id == id.id){
                                if(scope.layers[x].baseLayer.id){
                                    id.id = scope.layers[x].baseLayer.id;
                                    idFound = true;
                                }
                                else{
                                    for(var y in scope.layers[x].features){
                                        id.id = scope.layers[x].features[y].id;
                                        idFound = true;
                                        break;
                                    }
                                }
                                break;
                            }
                        }
                        if(!idFound) id.id = null;
                    }
                    if(!scope.$$phase) scope.$apply(scope.selectedId = id.id);
                    else scope.selectedId = id.id
                });

                scope.removeInfoEinheit = function(index){
                    if(scope.editMode) return;
                    for(var x in scope.layers[index].features){
                        if(scope.selectedId ==  scope.layers[index].features[x].id){
                            scope.selectedId = null;
                            scope.$emit('hideInfoBox');
                            break;
                        }
                    }
                    scope.$emit('removeInfoEinheit',scope.layers[index]);
                    scope.layers.splice(index,1);
                };

                scope.toogleFeatureLayer = function(index){
                    scope.$emit('toogleFeatureLayer',scope.layers[index]);
                    scope.layers[index].featureLayer.visible = !scope.layers[index].featureLayer.visible;
                };

                scope.$on('clearLayerList', function(e,id) {
                    scope.layers = [];
                });
            }
        };
    });
