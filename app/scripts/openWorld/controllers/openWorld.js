'use strict';

angular.module('udm.openWorld')
    .controller('OpenWorldCtrl', function ($scope,$http,layers, util) {

        $scope.mapClass = 'withTimeline';

        $scope.panelVisibility = {info : false,
            layerlist : false,
            imgslider : false};

        var infoEinheitenInMap = [];

        $http.get('/pg/getInfoEinheitenList').
            success(function(data, status, headers, config) {

                for(var x in data.list){
                    (function( infoEinheit ) {
                        infoEinheit.onClick = function(){

                            showInfoEinheit(infoEinheit);
                        }
                    })( data.list[x] );
                }


                $scope.$broadcast('addInfoElements',data.list);

//                showInfoEinheit(data.list[0]);
                showInfoEinheit(data.list[1]);
//                showInfoEinheit(data.list[2]);

            }).
            error(function(data, status, headers, config) {
                // called asynchronously if an error occurs
                // or server returns response with an error status.
            });

        var showInfoEinheit = function(infoEinheit){

            for(var x in infoEinheitenInMap){
                if(infoEinheitenInMap[x] == infoEinheit.id){
                    $scope.$broadcast('selectItem',{type:'infoEinheit',id:infoEinheitenInMap[x]});
                    return;
                }
            }

            $http.get('/pg/getInfoEinheit/'+infoEinheit.id).
                success(function(data, status, headers, config) {

                    var infoEinheit = data.infoEinheit;

                    for(var x in infoEinheit.features){
                        if(infoEinheit.features[x].typ != 'plan' && infoEinheit.features[x].typ != 'planOverlay'){
                            infoEinheit.features[x].feature =  util.WKTToFeature(infoEinheit.features[x].feature);
                            infoEinheit.features[x].feature.attributes.id = infoEinheit.features[x].id;
                            infoEinheit.features[x].feature.attributes.infoEinheit = infoEinheit.id;
                            infoEinheit.features[x].feature.attributes.element = infoEinheit.features[x];
                            infoEinheit.features[x].feature.attributes.onSelect = function(feature){
                                featureSelected(feature);
                            }
                        }
                    }

                    layers.addInfoEinheit(infoEinheit,'top');
                    infoEinheitenInMap.push(infoEinheit.id);

                    for(var x in infoEinheit.features){
                        if(infoEinheit.features[x].typ == 'plan'){
                            infoEinheit.baseLayer.title = infoEinheit.features[x].title;
                            infoEinheit.baseLayer.id = infoEinheit.features[x].id;
                        }
                        else if(infoEinheit.features[x].typ == 'planOverlay'){
                            infoEinheit.overlayLayer[infoEinheit.features[x].id].title = infoEinheit.features[x].title;
                            infoEinheit.overlayLayer[infoEinheit.features[x].id].id = infoEinheit.features[x].id;
                            infoEinheit.overlayLayer[infoEinheit.features[x].id].selected = false;
                        }
                    }

                    infoEinheit.selected = false;

                    $scope.$broadcast('showLayerInList',data.infoEinheit);


                    $scope.$broadcast('showInfo',data.infoEinheit);
                    $scope.panelVisibility.info = true;
                    $scope.panelVisibility.layerlist = true;
                }).
                error(function(data, status, headers, config) {
                    // called asynchronously if an error occurs
                    // or server returns response with an error status.
                });
        };

        var featureSelected = function(feature){
            if(!feature){
                if(!$scope.$$phase){
                    $scope.$apply($scope.panelVisibility.info = false);
                }
                else{
                    $scope.panelVisibility.info = false;
                }
                return;
            }
            $scope.panelVisibility.info = true;
            $scope.$broadcast('selectItem',{type:'feature', id: feature.attributes.element.id});
            $scope.$broadcast('showInfo', feature.attributes.element);
        };

        $scope.reorderLayers = function(e, ui){
            if(ui.item.sortable.resort){
                var infoEinheiten = ui.item.sortable.resort.$modelValue;

                for(var x in infoEinheiten){
                    if(ui.item.sortable.index == infoEinheiten[x].layerStackPosition){
                        layers.changeOrder(infoEinheiten[x].id,x);
                    }
                }
            }

        };

        $scope.$on('sliderChanged', function(e,value) {
            var ids = value.name.split('_');
            layers.setOpacity(ids[0],ids[1],ids[2],value.value/100);
        });

        $scope.$on('removeInfoEinheit', function(e,infoEinheit) {
            layers.removeInfoEinheit(infoEinheit.id);
            for(var x in infoEinheitenInMap){
                if(infoEinheitenInMap[x] == infoEinheit.id) infoEinheitenInMap.splice(x,1);
            }
        });

        $scope.$on('toogleFeatureLayer', function(e,infoEinheit) {
            layers.toogleVisibility('featureLayer',infoEinheit.id);
        });

        $scope.$on('showInfoPlan', function(e,feature) {
            $scope.panelVisibility.info = true;
            $scope.$broadcast('showInfo',feature);
        });

        $scope.$on('hideInfoBox', function(e,feature) {
            $scope.panelVisibility.info = false;
        });

    });
