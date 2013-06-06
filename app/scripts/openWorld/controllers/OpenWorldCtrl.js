'use strict';
/**
 * Controller for open world view
 * @name Controller:OpenWorldCtrl
 * @namespace
 * @author Andreas Krimbacher
 */
angular.module('udm.openWorld')
    .controller('OpenWorldCtrl', function ($scope,$http,mapInfoEinheit, util) {

        //reset the map
        $scope.$emit('$clearMap');

        //reset mapInfoEinheit service
        mapInfoEinheit.clearAllLayers();

        /**
         * Array of all Info-Einheiten in the map
         * @name Controller:OpenWorldCtrl#infoEinheitenInMap
         * @type {Array(object)}
         */
        var infoEinheitenInMap = [];
        var showOnlyBaseLayer = true;

        //get a list of all Info-Einheiten
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

        /**
         * show a Info-Einheit in the map
         * @name  Controller:OpenWorldCtrl#showInfoEinheit
         * @function
         * @param infoEinheit {intger} Id Info-Einheit
         */
        var showInfoEinheit = function(infoEinheit){
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
                                    var data = null;
                                    if(feature) data = feature.attributes.element;
                                    $scope.$broadcast('selectFeature',data);
                                }};
                            if(infoEinheit.features[x].typ == 'pointOri') attr.rot = infoEinheit.features[x].rot;
                            else attr.color = infoEinheit.features[x].color;

                            infoEinheit.features[x].feature =  util.WKTToFeature(infoEinheit.features[x].feature,attr);
                        }
                        else if(infoEinheit.features[x].typ == 'planOverlay' && showOnlyBaseLayer){
                            infoEinheit.features[x].opacity = 0;
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
                    }

                    infoEinheit.selected = false;

                    var onlyBase = false;
                    if(showOnlyBaseLayer) onlyBase = true;
                    $scope.$broadcast('showLayerInList',{infoEinheit:infoEinheit,mode:'openWorld',onlyBase:onlyBase});
                    $scope.$broadcast('toogleInfoControlVisibility',{type:'layerlist',state: true});

                    $scope.$broadcast('selectInfoEinheit',infoEinheit);
                }).
                error(function(data, status, headers, config) {
                    // called asynchronously if an error occurs
                    // or server returns response with an error status.
                });
        };

        /**
         * remove Info-Einheit from infoEinheitenInMap
         * @name  Controller:OpenWorldCtrl#infoEinheitRemoved
         * @event
         * @param id {intger} Id Info-Einheit
         */
        $scope.$on('infoEinheitRemoved', function(e,id) {
            for(var x=0; x < infoEinheitenInMap.length ; x++){
                if(infoEinheitenInMap[x].id == id) infoEinheitenInMap.splice(x,1);
            }
        });
    });
