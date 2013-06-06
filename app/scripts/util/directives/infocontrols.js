'use strict';
/**
 * Parent directive for the layerlist, infobox and imgslider
 * @name Directive:infocontrols
 * @namespace
 * @author Andreas Krimbacher
 */
angular.module('udm.util')
    .directive('infocontrols', function (mapInfoEinheit) {
        return {
            templateUrl: '../views/util/infoControls.html',
            restrict: 'E',
            link: function postLink(scope) {

                /**
                 * Id of selected Info-Feature
                 * @name Directive:infocontrols#selectedFeature
                 * @type {integer}
                 */
                var selectedFeature = null;
                /**
                 * Id of selected Info-Einheit
                 * @name Directive:infocontrols#selectedInfoEinheit
                 * @type {integer}
                 */
                var selectedInfoEinheit = null;

                /**
                 * visibility states of the layerlist, infobox and imgslider
                 * @name Directive:infocontrols#panelVisibility
                 * @type {object}
                 */
                scope.panelVisibility = {info : false,
                    layerlist : false,
                    imgslider : false};

                /**
                 * set the visibility of the layerlist, infobox and imgslider
                 * @name Directive:infocontrols#toogleInfoControlVisibility
                 * @event
                 * @param data {object} {type: controlType, state: true/false}
                 */
                scope.$on('toogleInfoControlVisibility', function(e,data) {
                    scope.panelVisibility[data.type] = data.state;
                });

                /**
                 * select Info-Feature
                 * @name Directive:infocontrols#selectFeature
                 * @event
                 * @param feature {object} Info-Feature
                 */
                scope.$on('selectFeature', function(e,feature) {
                    if(!feature){
                        if(!scope.$$phase){
                            scope.$apply(scope.panelVisibility.info = false,scope.panelVisibility.imgslider = false);
                        }
                        else{
                            scope.panelVisibility.info = false;
                            scope.panelVisibility.imgslider = false;
                        }

                        if(selectedFeature){
                            mapInfoEinheit.unselectfeature(selectedFeature,true);
                            selectedFeature = null;
                        }

                        return;
                    }
                    scope.panelVisibility.imgslider = false;
                    scope.panelVisibility.info = true;
                    scope.$broadcast('selectItem',{type:'feature', id: feature.id});
                    scope.$broadcast('showInfo', {data:feature});

                    if(selectedFeature && (selectedFeature.id == feature.id)) scope.showImageSlider(feature.img);
                    else if(selectedFeature) mapInfoEinheit.unselectfeature(selectedFeature,true);

                    selectedInfoEinheit = null;
                    selectedFeature = feature;
                });

                /**
                 * select Info-Einheit
                 * @name Directive:infocontrols#selectInfoEinheit
                 * @event
                 * @param feature {object} Info-Einheit
                 */
                scope.$on('selectInfoEinheit', function(e,infoEinheit) {
                    if(!infoEinheit){
                        if(!scope.$$phase){
                            scope.$apply(scope.panelVisibility.info = false,scope.panelVisibility.imgslider = false);
                        }
                        else{
                            scope.panelVisibility.info = false;
                            scope.panelVisibility.imgslider = false;
                        }

                        selectedInfoEinheit = null;

                        return;
                    }
                    scope.panelVisibility.imgslider = false;
                    scope.panelVisibility.info = true;
                    scope.$broadcast('selectItem',{type:'infoEinheit', id: infoEinheit.id});
                    scope.$broadcast('showInfo', {data:infoEinheit});
                    if(selectedInfoEinheit && (selectedInfoEinheit.id == infoEinheit.id)) scope.showImageSlider(infoEinheit.img);

                    if(selectedFeature){
                        mapInfoEinheit.unselectfeature(selectedFeature,true);
                        selectedFeature = null;
                    }

                    selectedInfoEinheit = infoEinheit;
                });

                /**
                 * reorder layers, used by the sortable directive
                 * @name Directive:infocontrols#reorderLayers
                 * @function
                 * @param e {object} event
                 * @param ui {object} sortable object
                 */
                scope.reorderLayers = function(e, ui){
                    if(ui.item.sortable.resort){
                        var infoEinheiten = ui.item.sortable.resort.$modelValue;
                        var x;
                        for(x = 0; x < infoEinheiten.length; x++){
                            if(ui.item.sortable.index == infoEinheiten[x].layerStackPosition){
                                mapInfoEinheit.changeOrder(infoEinheiten[x].id,x);
                            }
                        }
                    }
                };

                /**
                 * apply a slider change to the layer
                 * @name Directive:infocontrols#sliderChanged
                 * @event
                 * @param value {object} {value:sliderValue,name:name}
                 */
                scope.$on('sliderChanged', function(e,value) {
                    var ids = value.name.split('_');
                    mapInfoEinheit.setOpacity(ids[0],ids[1],ids[2],value.value/100);
                });

                /**
                 * event to remove Info-Einheit from layerlist,infobox and imageslider
                 * @name Directive:infocontrols#removeInfoEinheit
                 * @event
                 * @param infoEinheit {object} Info-Einheit
                 */
                scope.$on('removeInfoEinheit', function(e,infoEinheit) {
                    if(selectedInfoEinheit == infoEinheit.id) selectedInfoEinheit = null;
                    for(var x = 0; infoEinheit.features.length; x++){
                        if(infoEinheit.features[x].id == selectedFeature) selectedFeature = null; break;
                    }
                    mapInfoEinheit.removeInfoEinheit(infoEinheit.id);
                    scope.$emit('infoEinheitRemoved',infoEinheit.id);
                });

                /**
                 * toggle the visibility of the vector layer
                 * @name Directive:infocontrols#toogleFeatureLayer
                 * @event
                 * @param infoEinheit {object} Info-Einheit
                 */
                scope.$on('toogleFeatureLayer', function(e,infoEinheit) {
                    mapInfoEinheit.toggleVisibility('featureLayer',infoEinheit.id);
                });

                /**
                 * hide infobox
                 * @name Directive:infocontrols#hideInfoBox
                 * @event
                 */
                scope.$on('hideInfoBox', function() {
                    scope.panelVisibility.imgslider = false;
                    scope.panelVisibility.info = false;
                });

                /**
                 * show the image gallery
                 * @name Directive:infocontrols#showImageSlider
                 * @function
                 * @param img {Array(string)} array of image paths
                 */
                scope.showImageSlider = function(img){
                    if(!img || (img.length == 0)) return;
                    scope.panelVisibility.imgslider = true;
                    scope.$broadcast('setImg',img);

                };

                /**
                 * hide image gallery
                 * @name Directive:infocontrols#hideImageSlider
                 * @function
                 */
                scope.hideImageSlider = function(){
                    scope.panelVisibility.imgslider = false;
                };
            }
        };
    });
