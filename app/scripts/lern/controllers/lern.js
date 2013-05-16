'use strict';

angular.module('udm.lern')
    .controller('LernCtrl', function ($scope,$http,mapInfoEinheit, util) {

        $scope.$emit('$clearMap');


        $http.get('/pg/getLernEinheitList').
            success(function(data, status, headers, config) {

                $scope.lernEinheiten = data.list;
                $('#lernEinheitDialog').modal();
            }).
            error(function(data, status, headers, config) {
                // called asynchronously if an error occurs
                // or server returns response with an error status.
            });

        $scope.open = function(index){
            $http.get('/pg/getLernEinheit/'+$scope.lernEinheiten[index].id).
                success(function(data, status, headers, config) {

                    $scope.editLernEinheit = data.lernEinheit;
                    $scope.lernLektionen = data.lernEinheit.lernLektionen;

                    if(data.lernEinheit.info == 'null') data.lernEinheit.info = '';

                    for(var x in $scope.lernLektionen){
                        for(var y in $scope.lernLektionen[x].lernFeature){
                            if($scope.lernLektionen[x].lernFeature[y].info == 'null') $scope.lernLektionen[x].lernFeature[y].info = '';
                        }
                    }

                    $('#lernEinheitDialog').modal('hide');
                    $('#lernEinheitInfoDialog').modal();
                    $('#lernEinheitInfoDialog').on('hidden', function () {
                        $scope.start();
                    })
                }).
                error(function(data, status, headers, config) {
                    // called asynchronously if an error occurs
                    // or server returns response with an error status.
                });
        };


        $scope.first = true;
        $scope.last = false;

        $scope.currentLektion = 0;
        $scope.currentFeature = 0;

        $scope.start = function(){
            showFeature($scope.lernLektionen[$scope.currentLektion].lernFeature[$scope.currentFeature]);
            if($scope.currentLektion == ($scope.lernLektionen.length-1) && $scope.currentFeature == ($scope.lernLektionen[$scope.currentLektion].lernFeature.length-1)) $scope.last = true;
        };


        var showInfoEinheit = function(infoEinheit,selectFeature){

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

                    $scope.$broadcast('showLayerInList',{infoEinheit:data.infoEinheit,mode:'lern'});
                    $scope.$broadcast('toogleInfoControlVisibility',{type:'layerlist',state: true});


                    $scope.$broadcast('showInfo',{data:data.infoEinheit,mode:'lern'});
                    $scope.$broadcast('toogleInfoControlVisibility',{type:'info',state: true});


                    if(selectFeature){
                        $scope.$broadcast('selectItem',{type:'feature', id: selectFeature.id});
                        $scope.$broadcast('showInfo', {data:selectFeature});
                        if(selectFeature.typ != 'plan' && selectFeature.typ != 'planOverlay') mapInfoEinheit.selectfeature(selectFeature);
                    };

                }).
                error(function(data, status, headers, config) {
                    // called asynchronously if an error occurs
                    // or server returns response with an error status.
                });
        };

        var showFeature = function(lernFeature){


            mapInfoEinheit.removeAllInfoEinheiten();


            $scope.$broadcast('clearLayerList');
            $scope.$broadcast('toogleInfoControlVisibility',{type:'layerlist',state: false});
            $scope.$broadcast('toogleInfoControlVisibility',{type:'info',state: false});
            $scope.$broadcast('toogleInfoControlVisibility',{type:'imgslider',state: false});

            $scope.currentLernFeature = lernFeature;

            if(lernFeature.typ == 'infoEinheit') showInfoEinheit(lernFeature.infoEinheit,false);
            if(lernFeature.typ == 'feature') showInfoEinheit(lernFeature.infoEinheit,lernFeature.feature);
            if(lernFeature.typ == 'planVgl'){
                showInfoEinheit(lernFeature.plan1,false);
                showInfoEinheit(lernFeature.plan2,false);
                if(lernFeature.plan3) showInfoEinheit(lernFeature.plan3,false);
            }
        };

        $scope.previous = function(){
            if($scope.first) return;

            if($scope.currentFeature == 0){
                $scope.currentLektion--;
                $scope.currentFeature = $scope.lernLektionen[$scope.currentLektion].lernFeature.length-1;
            }
            else{
                $scope.currentFeature--;
            }
            if($scope.currentLektion == 0 && $scope.currentFeature == 0) $scope.first = true;
            else $scope.first = false;

            $scope.last = false;

            showFeature($scope.lernLektionen[$scope.currentLektion].lernFeature[$scope.currentFeature]);
        };

        $scope.next = function(){
            if($scope.last) return;

            if($scope.currentFeature == $scope.lernLektionen[$scope.currentLektion].lernFeature.length-1){
                $scope.currentLektion++;
                $scope.currentFeature = 0;
            }
            else{
                $scope.currentFeature++;
            }
            if($scope.currentLektion == ($scope.lernLektionen.length-1) && $scope.currentFeature == ($scope.lernLektionen[$scope.currentLektion].lernFeature.length-1)) $scope.last = true;
            else  $scope.last = false;

            $scope.first = false;

            showFeature($scope.lernLektionen[$scope.currentLektion].lernFeature[$scope.currentFeature]);
        };

        $scope.startAtLektion = function(lektion){
            $scope.currentLektion = lektion;
            $scope.currentFeature = 0;

            if(lektion == 0) $scope.first = true;
            else  $scope.first = false;

            if($scope.currentLektion == ($scope.lernLektionen.length-1) && $scope.currentFeature == ($scope.lernLektionen[$scope.currentLektion].lernFeature.length-1)) $scope.last = true;
            else  $scope.last = false;

            showFeature($scope.lernLektionen[$scope.currentLektion].lernFeature[$scope.currentFeature]);

        };



    });
