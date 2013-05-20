'use strict';

angular.module('udm.lern')
    .controller('LernCtrl', function ($scope,$http,mapInfoEinheit, util) {

        $scope.$emit('$clearMap');

        $scope.startLektion = null;
        $scope.tip = 'Tip: Sind für eine Einheit Bilder vorhanden können diese mithilfe des Button am untern Ende des Infofensters angezeigt werden.';

        mapInfoEinheit.clearAllLayers();

        $http.get('/pg/getLernEinheitList').
            success(function(data) {

                $scope.lernEinheiten = data.list;

                var x;
                for(x = 0; x < $scope.lernEinheiten.length; x++){
                    var split = $scope.lernEinheiten[x].info.search('\n\n');

                    $scope.lernEinheiten[x].shortInfo = $scope.lernEinheiten[x].info.substring(0,split);
                    $scope.lernEinheiten[x].longInfo = $scope.lernEinheiten[x].info.substring(split+2,$scope.lernEinheiten[x].info.length);
                }

                $('#lernEinheitDialog').modal().on('hidden', function () {
                    $scope.checkLernEinheitSelected();
                    selected = true;
                });
            }).
            error(function(data, status, headers, config) {
                // called asynchronously if an error occurs
                // or server returns response with an error status.
            });

        var selected = false;
        $scope.checkLernEinheitSelected = function(){
            if(!selected){
                $scope.setRoute('/world');
            }
            selected = true;
        };

        $scope.open = function(index){
           selected = true;

            $http.get('/pg/getLernEinheit/'+$scope.lernEinheiten[index].id).
                success(function(data) {
                    $scope.lernEinheit =  data.lernEinheit;

                    var split = $scope.lernEinheit.info.search('\n\n');

                    $scope.lernEinheit.shortInfo = $scope.lernEinheit.info.substring(0,split);
                    $scope.lernEinheit.longInfo = $scope.lernEinheit.info.substring(split+2,$scope.lernEinheit.info.length);


                    $scope.lernLektionen = data.lernEinheit.lernLektionen;

                    $scope.lernLektionen.sort(function(a, b){
                        return a.order-b.order;
                    });

                    if($scope.lernLektionen[0].title == 'Start'){
                        $scope.startLektion = $scope.lernLektionen[0];
                        $scope.lernLektionen.splice(0,1);
                    }

                    if(data.lernEinheit.info == 'null') data.lernEinheit.info = '';

                    var x;
                    for(x= 0; x < $scope.lernLektionen.length; x++){
                        $scope.lernLektionen[x].lernFeature.sort(function(a, b){
                            return a.order-b.order;
                        });
                        for(var y= 0; y < $scope.lernLektionen[x].lernFeature.length; y++){
                            if($scope.lernLektionen[x].lernFeature[y].info == 'null') $scope.lernLektionen[x].lernFeature[y].info = '';
                        }
                    }

                    $('#lernEinheitDialog').modal('hide');

                    if($scope.startLektion){
                        $scope.start();
                    }
                    else{
                        $('#lernEinheitInfoDialog').modal().on('hidden', function () {
                            $scope.start();
                        });
                    }

                }).
                error(function(data, status, headers, config) {
                    // called asynchronously if an error occurs
                    // or server returns response with an error status.
                });
        };


        $scope.first = true;
        $scope.last = false;

        $scope.currentLektion = -1;
        $scope.currentFeature = 0;

        $scope.start = function(){
            if($scope.startLektion){
                showStartLektion();
            }
            else{
                $scope.currentLektion = 0;
                showFeature($scope.lernLektionen[0].lernFeature[0],false);
            }
        };


        var showInfoEinheit = function(infoEinheit,selectFeature,visibility,lernInfo,onlyAdjust){

            $http.get('/pg/getInfoEinheit/'+infoEinheit).
                success(function(data) {

                    var infoEinheit = data.infoEinheit;

                    infoEinheit.hasBaseLayer = false;
                    infoEinheit.hasFeatureLayer = false;


                    infoEinheit.lernInfo = lernInfo;
                    var attr;
                    var x;
                    for(x=0; x < infoEinheit.features.length; x++){
                        infoEinheit.features[x].lernInfo = lernInfo;
                        if(typeof visibility === 'object'){
                            if(typeof visibility[infoEinheit.features[x].id] !== 'undefined')
                                infoEinheit.features[x].hideInMap = !visibility[infoEinheit.features[x].id];
                        }
                        if(infoEinheit.features[x].typ != 'plan' && infoEinheit.features[x].typ != 'planOverlay'){

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

                            if(!infoEinheit.features[x].hideInMap) infoEinheit.hasFeatureLayer = true;
                        }
                        else if(infoEinheit.features[x].typ == 'planOverlay' && visibility == 'plan'){
                            infoEinheit.features[x].opacity = 0;
                        }
                    }

                    if(onlyAdjust) mapInfoEinheit.changeInfoEinheit(infoEinheit,'top');
                    else mapInfoEinheit.addInfoEinheit(infoEinheit,'top');

                    for(x=0; x < infoEinheit.features.length; x++){
                        if(infoEinheit.features[x].typ == 'plan' && !infoEinheit.features[x].hideInMap){
                            infoEinheit.hasBaseLayer = true;
                            infoEinheit.baseLayer.title = infoEinheit.features[x].title;
                            infoEinheit.baseLayer.id = infoEinheit.features[x].id;
                        }
                        else if(infoEinheit.features[x].typ == 'planOverlay' && !infoEinheit.features[x].hideInMap){
                            infoEinheit.overlayLayer[infoEinheit.features[x].id].title = infoEinheit.features[x].title;
                            infoEinheit.overlayLayer[infoEinheit.features[x].id].id = infoEinheit.features[x].id;
                            infoEinheit.overlayLayer[infoEinheit.features[x].id].selected = false;
                        }
                        if(selectFeature && infoEinheit.features[x].id == selectFeature) selectFeature = infoEinheit.features[x];
                    }

                    infoEinheit.selected = false;

                    var onlyBase = false;
                    if(visibility == 'plan') onlyBase = true;
                    $scope.$broadcast('showLayerInList',{infoEinheit:data.infoEinheit,mode:'lern',onlyBase:onlyBase});
                    $scope.$broadcast('toogleInfoControlVisibility',{type:'layerlist',state: true});

                    $scope.$broadcast('showInfo',{data:data.infoEinheit,mode:'lern'});
                    $scope.$broadcast('toogleInfoControlVisibility',{type:'info',state: true});

                    if(selectFeature){
                        $scope.$broadcast('selectItem',{type:'feature', id: selectFeature.id});
                        $scope.$broadcast('showInfo', {data:selectFeature});
                        if(selectFeature.typ != 'plan' && selectFeature.typ != 'planOverlay') mapInfoEinheit.selectfeature(selectFeature);
                    }

                }).
                error(function(data, status, headers, config) {
                    // called asynchronously if an error occurs
                    // or server returns response with an error status.
                });
        };

        var showStartLektion = function(){

            mapInfoEinheit.removeAllInfoEinheiten();

            $scope.$broadcast('clearLayerList');
            $scope.$broadcast('toogleInfoControlVisibility',{type:'layerlist',state: false});
            $scope.$broadcast('toogleInfoControlVisibility',{type:'info',state: false});
            $scope.$broadcast('toogleInfoControlVisibility',{type:'imgslider',state: false});

            var feature = $scope.startLektion.lernFeature[0];
            $scope.currentLernFeature = feature;


            var visibility = feature.visible;

            mapInfoEinheit.setMapView(feature.mapView);

            $http.get('/pg/getInfoEinheit/'+feature.infoEinheit).
                success(function(data) {

                    var infoEinheit = data.infoEinheit;

                    infoEinheit.hasBaseLayer = false;
                    infoEinheit.hasFeatureLayer = false;

                    var info = {
                        title : infoEinheit.title,
                        lernInfo : $scope.tip,
                        info : $scope.lernEinheit.longInfo,
                        img : infoEinheit.img
                    };

                    infoEinheit.title = $scope.lernEinheit.title;

                    var attr;
                    var x;
                    for(x=0; x < infoEinheit.features.length; x++){
                        if(typeof visibility === 'object'){
                            if(typeof visibility[infoEinheit.features[x].id] !== 'undefined')
                                infoEinheit.features[x].hideInMap = !visibility[infoEinheit.features[x].id];
                        }
                        if(infoEinheit.features[x].typ != 'plan' && infoEinheit.features[x].typ != 'planOverlay'){

                            infoEinheit.features[x].typ = 'start';

                            attr = {typ : infoEinheit.features[x].typ,
                                id : infoEinheit.features[x].id,
                                infoEinheit : infoEinheit.id,
                                element : infoEinheit.features[x],
                                onSelect : function(feature){}};

                            if(infoEinheit.features[x].typ == 'pointOri') attr.rot = infoEinheit.features[x].rot;
                            else attr.color = infoEinheit.features[x].color;

                            infoEinheit.features[x].feature =  util.WKTToFeature(infoEinheit.features[x].feature,attr);

                        }
                    }

                    mapInfoEinheit.addInfoEinheit(infoEinheit,'top');

                    $scope.$broadcast('showLayerInList',{infoEinheit:data.infoEinheit,mode:'lernStart'});
                    $scope.$broadcast('toogleInfoControlVisibility',{type:'layerlist',state: true});

                    $scope.$broadcast('showInfo',{data:info,mode:'lernStart'});
                    $scope.$broadcast('toogleInfoControlVisibility',{type:'info',state: true});


                }).
                error(function(data, status, headers, config) {
                    // called asynchronously if an error occurs
                    // or server returns response with an error status.
                });
        };

        var showFeature = function(lernFeature,onlyAdjust){

            if(!onlyAdjust) mapInfoEinheit.removeAllInfoEinheiten();

            $scope.$broadcast('clearLayerList');
            $scope.$broadcast('toogleInfoControlVisibility',{type:'layerlist',state: false});
            $scope.$broadcast('toogleInfoControlVisibility',{type:'info',state: false});
            $scope.$broadcast('toogleInfoControlVisibility',{type:'imgslider',state: false});

            $scope.currentLernFeature = lernFeature;

            mapInfoEinheit.setMapView(lernFeature.mapView);

            if(lernFeature.typ == 'infoEinheit') showInfoEinheit(lernFeature.infoEinheit,false,lernFeature.visible,lernFeature.info,onlyAdjust);
            if(lernFeature.typ == 'feature') showInfoEinheit(lernFeature.infoEinheit,lernFeature.feature,lernFeature.visible,lernFeature.info,onlyAdjust);
            if(lernFeature.typ == 'planVgl'){
                showInfoEinheit(lernFeature.plan1,false,'plan',lernFeature.info,false);
                showInfoEinheit(lernFeature.plan2,false,'plan',lernFeature.info,false);
                if(lernFeature.plan3) showInfoEinheit(lernFeature.plan3,false,'plan',lernFeature.info,false);
            }
        };


        $scope.previous = function(){
            if($scope.first) return;

            var onlyAdjust = false;

            if($scope.currentFeature == 0){
                $scope.currentLektion--;
                if($scope.currentLektion == -1) $scope.currentFeature = 0;
                else $scope.currentFeature = $scope.lernLektionen[$scope.currentLektion].lernFeature.length-1;
            }
            else{
                onlyAdjust = true;
                $scope.currentFeature--;
            }
            $scope.first = (($scope.currentLektion == 0 && $scope.currentFeature == 0 && !$scope.startLektion) || $scope.currentLektion == -1);

            $scope.last = false;

            if($scope.currentLektion == -1) showStartLektion();
            else showFeature($scope.lernLektionen[$scope.currentLektion].lernFeature[$scope.currentFeature],onlyAdjust);
        };

        $scope.next = function(){
            if($scope.last) return;

            var onlyAdjust = false;

            if($scope.currentLektion == -1 || ($scope.currentFeature == $scope.lernLektionen[$scope.currentLektion].lernFeature.length-1)){
                $scope.currentLektion++;
                $scope.currentFeature = 0;
            }
            else{
                onlyAdjust = true;
                $scope.currentFeature++;
            }
            $scope.last = ($scope.currentLektion == ($scope.lernLektionen.length-1) && $scope.currentFeature == ($scope.lernLektionen[$scope.currentLektion].lernFeature.length-1));

            $scope.first = false;

            showFeature($scope.lernLektionen[$scope.currentLektion].lernFeature[$scope.currentFeature],onlyAdjust);
        };

        $scope.startAtLektion = function(lektion){
            $scope.currentLektion = lektion;
            $scope.currentFeature = 0;

            $scope.first = (lektion == 0 && !$scope.startLektion) || (lektion == -1);


            $scope.last = ($scope.currentLektion == ($scope.lernLektionen.length-1) && $scope.currentFeature == ($scope.lernLektionen[$scope.currentLektion].lernFeature.length-1));

            if($scope.currentLektion == -1) showStartLektion();
            else showFeature($scope.lernLektionen[$scope.currentLektion].lernFeature[$scope.currentFeature],false);
        };
    });
