'use strict';

angular.module('udm.openWorld')
    .controller('OpenWorldCtrl', function ($scope,$http,mapInfoEinheit, util) {

        $scope.$emit('$clearMap');

        mapInfoEinheit.clearAllLayers();

        var infoEinheitenInMap = [];

        $http.get('/pg/getInfoEinheitenList').
            success(function(data) {

                for(var x = data.list.length - 1; x >= 0; x--){
                    if(data.list[x].start == data.list[x].end){
                        data.list.splice(x,1);

                    }
                        (function( infoEinheit ) {
                            infoEinheit.onClick = function(){

                                showInfoEinheit(infoEinheit.id);
                            }
                        })( data.list[x] );
                }


                $scope.$broadcast('addInfoElements',data.list);

            }).
            error(function(data, status, headers, config) {
                // called asynchronously if an error occurs
                // or server returns response with an error status.
            });

        var showInfoEinheit = function(infoEinheit,selectFeature){
            var x;
            for(x=0; x < infoEinheitenInMap.length ; x++){
                if(infoEinheitenInMap[x].id == infoEinheit){
                    $scope.$broadcast('selectItem',{type:'infoEinheit',id:infoEinheitenInMap[x].id});
                    $scope.$broadcast('showInfo',{data:infoEinheitenInMap[x],mode:'openWorld'});
                    $scope.$broadcast('toogleInfoControlVisibility',{type:'info',state: true});
                    return;
                }
            }

            if(infoEinheitenInMap.length > 2){
                var removedId = mapInfoEinheit.removeBottomInfoEinheit();
                for(x=0; x < infoEinheitenInMap.length ; x++){
                    if(infoEinheitenInMap[x].id == removedId){
                        infoEinheitenInMap.splice(x,1);
                        $scope.$broadcast('removeInfoEinheitFromLayerList',removedId);
                        break;
                    }
                }
            }

            $http.get('/pg/getInfoEinheit/'+infoEinheit).
                success(function(data) {

                    var infoEinheit = data.infoEinheit;

                    infoEinheit.hasBaseLayer = false;
                    infoEinheit.hasFeatureLayer = false;

                    var attr;
                    for(x=0; x < infoEinheit.features.length; x++){
                        if(infoEinheit.features[x].typ != 'plan' && infoEinheit.features[x].typ != 'planOverlay'){
                            infoEinheit.hasFeatureLayer = true;

                            attr = {typ : infoEinheit.features[x].typ,
                                id : infoEinheit.features[x].id,
                                infoEinheit : infoEinheit.id,
                                element : infoEinheit.features[x],
                                onSelect : function(feature){
                                    $scope.$broadcast('featureSelected',feature);
                                }};
                            if(infoEinheit.features[x].typ == 'pointOri') attr.rot = infoEinheit.features[x].rot;
                            else attr.color = infoEinheit.features[x].color;

                            infoEinheit.features[x].feature =  util.WKTToFeature(infoEinheit.features[x].feature,attr);
                        }
                    }

                    mapInfoEinheit.addInfoEinheit(infoEinheit,'top');
                    infoEinheitenInMap.push(infoEinheit);

                    for(x=0; x < infoEinheit.features.length; x++){
                        if(infoEinheit.features[x].typ == 'plan'){
                            infoEinheit.baseLayer.title = infoEinheit.features[x].title;
                            infoEinheit.baseLayer.id = infoEinheit.features[x].id;
                            infoEinheit.hasBaseLayer = true;
                        }
                        else if(infoEinheit.features[x].typ == 'planOverlay'){
                            infoEinheit.overlayLayer[infoEinheit.features[x].id].title = infoEinheit.features[x].title;
                            infoEinheit.overlayLayer[infoEinheit.features[x].id].id = infoEinheit.features[x].id;
                            infoEinheit.overlayLayer[infoEinheit.features[x].id].selected = false;
                        }
                        if(selectFeature && infoEinheit.features[x].id == selectFeature) selectFeature = infoEinheit.features[x];
                    }

                    infoEinheit.selected = false;

                    $scope.$broadcast('showLayerInList',{infoEinheit:data.infoEinheit,mode:'openWorld'});
                    $scope.$broadcast('toogleInfoControlVisibility',{type:'layerlist',state: true});

                    $scope.$broadcast('showInfo',{data:data.infoEinheit,mode:'openWorld'});
                    $scope.$broadcast('toogleInfoControlVisibility',{type:'info',state: true});
                }).
                error(function(data, status, headers, config) {
                    // called asynchronously if an error occurs
                    // or server returns response with an error status.
                });
        };

        $scope.$on('infoEinheitRemoved', function(e,id) {
            for(var x=0; x < infoEinheitenInMap.length ; x++){
                if(infoEinheitenInMap[x].id == id) infoEinheitenInMap.splice(x,1);
            }
        });



    });
