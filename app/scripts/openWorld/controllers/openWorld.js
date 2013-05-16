'use strict';

angular.module('udm.openWorld')
    .controller('OpenWorldCtrl', function ($scope,$http,mapInfoEinheit, util) {

        $scope.$emit('$clearMap');

        var infoEinheitenInMap = [];

        $http.get('/pg/getInfoEinheitenList').
            success(function(data, status, headers, config) {

                for(var x in data.list){
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

            for(var x in infoEinheitenInMap){
                if(infoEinheitenInMap[x].id == infoEinheit){
                    $scope.$broadcast('selectItem',{type:'infoEinheit',id:infoEinheitenInMap[x].id});
                    $scope.$broadcast('showInfo',{data:infoEinheitenInMap[x],mode:'openWorld'});
                    $scope.$broadcast('toogleInfoControlVisibility',{type:'info',state: true});
                    return;
                }
            }

            $http.get('/pg/getInfoEinheit/'+infoEinheit).
                success(function(data, status, headers, config) {

                    var infoEinheit = data.infoEinheit;

                    for(var x in infoEinheit.features){
                        if(infoEinheit.features[x].typ != 'plan' && infoEinheit.features[x].typ != 'planOverlay'){
                            infoEinheit.features[x].feature =  util.WKTToFeature(infoEinheit.features[x].feature);
                            infoEinheit.features[x].feature.attributes.id = infoEinheit.features[x].id;
                            infoEinheit.features[x].feature.attributes.infoEinheit = infoEinheit.id;
                            infoEinheit.features[x].feature.attributes.element = infoEinheit.features[x];
                            infoEinheit.features[x].feature.attributes.typ = infoEinheit.features[x].typ;
                            infoEinheit.features[x].feature.attributes.rot = infoEinheit.features[x].rot;
                            infoEinheit.features[x].feature.attributes.onSelect = function(feature){
                                $scope.$broadcast('featureSelected',feature);
                            }
                        }
                    }

                    mapInfoEinheit.addInfoEinheit(infoEinheit,'top');
                    infoEinheitenInMap.push(infoEinheit);

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
            for(var x in infoEinheitenInMap){
                if(infoEinheitenInMap[x].id == id) infoEinheitenInMap.splice(x,1);
            }
        });



    });
