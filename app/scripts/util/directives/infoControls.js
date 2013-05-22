'use strict';

angular.module('udm.util')
    .directive('infocontrols', function (mapInfoEinheit) {
        return {
            templateUrl: '../views/util/infoControls.html',
            restrict: 'E',
            link: function postLink(scope) {

                var selectedFeature = null;
                var selectedInfoEinheit = null;

                scope.panelVisibility = {info : false,
                    layerlist : false,
                    imgslider : false};

                scope.$on('toogleInfoControlVisibility', function(e,data) {
                    scope.panelVisibility[data.type] = data.state;
                });

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

                scope.$on('sliderChanged', function(e,value) {
                    var ids = value.name.split('_');
                    mapInfoEinheit.setOpacity(ids[0],ids[1],ids[2],value.value/100);
                });

                scope.$on('removeInfoEinheit', function(e,infoEinheit) {
                    if(selectedInfoEinheit == infoEinheit.id) selectedInfoEinheit = null;
                    for(var x = 0; infoEinheit.features.length; x++){
                        if(infoEinheit.features[x].id == selectedFeature) selectedFeature = null; break;
                    }
                    mapInfoEinheit.removeInfoEinheit(infoEinheit.id);
                    scope.$emit('infoEinheitRemoved',infoEinheit.id);
                });

                scope.$on('toogleFeatureLayer', function(e,infoEinheit) {
                    mapInfoEinheit.toggleVisibility('featureLayer',infoEinheit.id);
                });

                scope.$on('hideInfoBox', function() {
                    scope.panelVisibility.imgslider = false;
                    scope.panelVisibility.info = false;
                });

                scope.showImageSlider = function(img){
                    if(!img || (img.length == 0)) return;
                    scope.panelVisibility.imgslider = true;
                    scope.$broadcast('setImg',img);

                };
                scope.hideImageSlider = function(){
                    scope.panelVisibility.imgslider = false;
                };
            }
        };
    });
