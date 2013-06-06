'use strict';
/**
 * Directive for the layerlist
 * @name Directive:layerlist
 * @namespace
 * @author Andreas Krimbacher
 */
angular.module('udm.util')
    .directive('layerlist', function () {
        return {
            templateUrl: '../views/util/layerlist.html',
            restrict: 'E',
            link: function postLink(scope) {

                /**
                 * Layers in the layerlist
                 * @nameDirective:layerlist#layers
                 * @type {Array(object)}
                 */
                scope.layers = [];

                /**
                 * Id of the selected feature in the list
                 * @nameDirective:layerlist#selectedId
                 * @type {integer}
                 */
                scope.selectedId = null;

                //used to disable the click events
                scope.editMode = '';

                /**
                 * select a feature in the layer list and show info in the info box
                 * @name Directive:layerlist#selectItem
                 * @function
                 * @param infoEinheit {integer} Id Info-Einheit
                 * @param feature {integer} Id Info-Feature
                 */
                scope.selectItem = function(infoEinheit,feature){
                    if(scope.editMode == 'lernStart') return;

                    var x;
                    var y;
                    for(x = 0; x < scope.layers.length; x++){
                        if(scope.layers[x].id == infoEinheit){
                            if(feature){
                                for(y = 0; y < scope.layers[x].features.length; y++){
                                    if(scope.layers[x].features[y].id == feature){
                                        if(scope.layers[x].features[y].typ == 'plan') scope.$emit('selectInfoEinheit',scope.layers[x]);
                                        else scope.$emit('selectFeature',scope.layers[x].features[y]);
                                        return;
                                    }
                                }
                            }
                            else{
                                scope.$emit('selectInfoEinheit',scope.layers[x]);
                            }
                        }
                    }
                };

                /**
                 * show a Info-Einheit in the layerlist
                 * @name Directive:layerlist#showLayerInList
                 * @event
                 * @param data {object} {data: Info-Einheit}
                 */
                scope.$on('showLayerInList', function(e,data) {
                    var infoEinheit = data.infoEinheit;
                    scope.editMode = data.mode;
                    infoEinheit.editMode = data.mode;

                    scope.layers.splice(0,0,infoEinheit);

                    if(data.onlyBase) scope.toogleFeatureLayer(0);
                });

                /**
                 * event to select a item in the layerlist
                 * @name Directive:layerlist#selectItem
                 * @event
                 * @param data {object} {id: Id Info-Feature}
                 */
                scope.$on('selectItem', function(e,data) {
                    if(data.type == 'infoEinheit'){
                        var idFound = false;
                        var x;
                        for(x = 0; x < scope.layers.length; x++){
                            if(scope.layers[x].id == data.id){
                                if(scope.layers[x].baseLayer.id){
                                    data.id = scope.layers[x].baseLayer.id;
                                    idFound = true;
                                }
                                else{
                                    data.id = scope.layers[x].features[0].id;
                                        idFound = true;
                                }
                                break;
                            }
                        }
                        if(!idFound) data.id = null;
                    }
                    if(!scope.$$phase) scope.$apply(scope.selectedId = data.id);
                    else scope.selectedId = data.id
                });

                /**
                 * remove Info-Einheit from layerlist
                 * @name Directive:layerlist#removeInfoEinheit
                 * @function
                 * @param index {integer} index in layers
                 */
                scope.removeInfoEinheit = function(index){
                    if(scope.editMode == 'lern') return;
                    var x;
                    for(x = 0; x < scope.layers[index].features.length; x++){
                        if(scope.selectedId ==  scope.layers[index].features[x].id){
                            scope.selectedId = null;
                            scope.$emit('hideInfoBox');
                            break;
                        }
                    }
                    scope.$emit('removeInfoEinheit',scope.layers[index]);
                    scope.layers.splice(index,1);
                };

                /**
                 * event to remove Info-Einheit from layerlist
                 * @name Directive:layerlist#removeInfoEinheitFromLayerList
                 * @event
                 * @param id {integer} Id Info-Einheit
                 */
                scope.$on('removeInfoEinheitFromLayerList', function(e,id) {
                    var x;
                    var index;

                    for(x = 0; x < scope.layers.length; x++){
                        if(scope.layers[x].id ==  id){
                            index = x;
                            break;
                        }
                    }

                    for(x = 0; x < scope.layers[index].features.length; x++){
                        if(scope.selectedId ==  scope.layers[index].features[x].id){
                            scope.selectedId = null;
                            scope.$emit('hideInfoBox');
                            break;
                        }
                    }
                    scope.layers.splice(index,1);
                });

                /**
                 * toggle the visibility of the vector layer
                 * @name Directive:layerlist#toogleFeatureLayer
                 * @function
                 * @param index {integer} index of Info-Einheit in layers
                 */
                scope.toogleFeatureLayer = function(index){
                    scope.$emit('toogleFeatureLayer',scope.layers[index]);
                    scope.layers[index].featureLayer.visible = !scope.layers[index].featureLayer.visible;
                };

                /**
                 * clear layerlist
                 * @name Directive:layerlist#clearLayerList
                 * @event
                 */
                scope.$on('clearLayerList', function() {
                    scope.layers = [];
                });
            }
        };
    });
