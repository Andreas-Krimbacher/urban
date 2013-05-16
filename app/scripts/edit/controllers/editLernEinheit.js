'use strict';

angular.module('udm.edit')
    .controller('EditLernEinheitCtrl', function ($scope,$http,$timeout,mapInfoEinheit,util) {

        $scope.topTitle = 'Übersicht';
        $scope.mode = 'list';

        $scope.nextLernEinheitId = null;
        $scope.nextLernLektionId = null;
        $scope.nextLernFeatureId = null;


        $scope.lernEinheiten = [];
        $scope.lernLektionen = [];

        $scope.origInfoEinheiten = [];
        $scope.infoEinheiten = [];
        $scope.feature = [];

        $scope.editLernEinheit = {};
        $scope.newLernEinheitTitle = null;
        $scope.creatingNewLernEinheit = false;

        $scope.editLernLektion = null;
        $scope.creatingNewLernLektion = false;

        $scope.editLernFeature = null;
        $scope.creatingNewLernFeature = false;

        $scope.featureEditing = false;
        $scope.featureValid = false;

        $scope.featuresToDelete = [];
        $scope.lektionenToDelete = [];


        //functions to show and hide features in the map -----------------------------------------------------------------

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

        var removeAllFeaturesFromMap = function(){

            mapInfoEinheit.removeAllInfoEinheiten();

            $scope.$broadcast('clearLayerList');
            $scope.$broadcast('toogleInfoControlVisibility',{type:'layerlist',state: false});
            $scope.$broadcast('toogleInfoControlVisibility',{type:'info',state: false});
            $scope.$broadcast('toogleInfoControlVisibility',{type:'imgslider',state: false});

        };


        //--------------------------------------------------------------------------------------------------------------



        $http.get('/pg/getLernEinheitList').
            success(function(data, status, headers, config) {
                $scope.nextLernEinheitId = data.nextLernEinheitId;
                $scope.nextLernLektionId = data.nextLernLektionId;
                $scope.nextLernFeatureId = data.nextLernFeatureId;
                $scope.lernEinheiten = data.list;
            }).
            error(function(data, status, headers, config) {
                // called asynchronously if an error occurs
                // or server returns response with an error status.
            });


        $scope.editLernEinheitMode = function(index){

            if(index == -1){
                $scope.editLernEinheit = {};
                $scope.editLernEinheit.id = $scope.nextLernEinheitId;
                $scope.nextLernEinheitId++;
                $scope.editLernEinheit.title = $scope.newLernEinheitTitle;

                $scope.lernLektionen = [];

                $scope.creatingNewLernEinheit = true;

                $scope.topTitle = 'Lern-Einheit';
                $scope.mode = 'editLernEinheit';
            }
            else{
                $http.get('/pg/getLernEinheit/'+$scope.lernEinheiten[index].id).
                    success(function(data, status, headers, config) {
                        $scope.nextLernLektionId = data.nextLernLektionId;
                        $scope.nextLernFeatureId = data.nextLernFeatureId;

                        $scope.editLernEinheit = data.lernEinheit;
                        $scope.lernLektionen = data.lernEinheit.lernLektionen;

                        if(data.lernEinheit.info == 'null') data.lernEinheit.info = '';

                        for(var x in $scope.lernLektionen){
                            for(var y in $scope.lernLektionen[x].lernFeature){
                                if($scope.lernLektionen[x].lernFeature[y].info == 'null') $scope.lernLektionen[x].lernFeature[y].info = '';
                            }
                        }

                        $scope.creatingNewLernEinheit = false;

                        $scope.topTitle = 'Lern-Einheit';
                        $scope.mode = 'editLernEinheit';

                    }).
                    error(function(data, status, headers, config) {
                        // called asynchronously if an error occurs
                        // or server returns response with an error status.
                    });
            }
        };

        $scope.deleteLernEinheit = function(index){
            $http.get('/pg/deleteLernEinheit/'+$scope.lernEinheiten[index].id).
                success(function(data, status, headers, config) {
                    $scope.lernEinheiten.splice(index,1);
                }).
                error(function(data, status, headers, config) {
                    // called asynchronously if an error occurs
                    // or server returns response with an error status.
                });

        };

        $scope.editLernLektionMode = function(index){

            $http.get('/pg/getInfoEinheitenList').
                success(function(data, status, headers, config) {
                    $scope.origInfoEinheiten = data.list;
                }).
                error(function(data, status, headers, config) {
                    // called asynchronously if an error occurs
                    // or server returns response with an error status.
                });

            if(index == -1){
                $scope.editLernLektion = {};
                $scope.editLernLektion.id = $scope.nextLernLektionId;
                $scope.nextLernLektionId++;

                $scope.editLernLektion.title = $scope.newLernLektionTitle;
                $scope.editLernLektion.lernFeature = [];
                $scope.editLernFeature = null;
                $scope.featureEditing = false;
                $scope.creatingNewLernLektion = true;

                $scope.topTitle = 'Lern-Lektion';
                $scope.mode = 'editLernLektion';
            }
            else{
                $scope.creatingNewLernLektion = false;
                $scope.editLernLektion = $scope.lernLektionen[index];
                $scope.editLernFeature = null;
                $scope.featureEditing = false;

                $scope.topTitle = 'Lern-Lektion';
                $scope.mode = 'editLernLektion';
            }
        };

        $scope.deleteLernLektion = function(index){
            $scope.lektionenToDelete.push($scope.lernLektionen[index].id);
            $scope.lernLektionen.splice(index,1);
        };


        $scope.editLernFeatureMode = function(index){
            angular.copy($scope.origInfoEinheiten, $scope.infoEinheiten);
            removeAllFeaturesFromMap();
            if(index == -1){
                $scope.editLernFeature = {};
                $scope.editLernFeature.id = $scope.nextLernFeatureId;
                $scope.nextLernFeatureId++;
                $scope.creatingNewLernFeature = true;
                $scope.featureEditing = true;
            }
            else{
                $scope.creatingNewLernFeature = false;
                $timeout(function(){$scope.editLernFeature = $scope.editLernLektion.lernFeature[index];});
                $scope.featureEditing = true;


                var lernFeature = $scope.editLernLektion.lernFeature[index];
                //show in Map
                if(lernFeature.typ == 'infoEinheit') showInfoEinheit(lernFeature.infoEinheit,false);
                if(lernFeature.typ == 'feature') showInfoEinheit(lernFeature.infoEinheit,lernFeature.feature);
                if(lernFeature.typ == 'planVgl'){
                    showInfoEinheit(lernFeature.plan1,false);
                    showInfoEinheit(lernFeature.plan2,false);
                    if(lernFeature.plan3) showInfoEinheit(lernFeature.plan3,false);
                }


                if(lernFeature.typ == 'feature'){
                    $http.get('/pg/getInfoEinheit/' + lernFeature.infoEinheit).
                        success(function(data, status, headers, config) {
                            for(var x in data.infoEinheit.features){
                                if( data.infoEinheit.features[x].typ == 'plan') data.infoEinheit.features.splice(x,1);
                            }
                            $scope.feature = data.infoEinheit.features;
                        }).
                        error(function(data, status, headers, config) {
                            // called asynchronously if an error occurs
                            // or server returns response with an error status.
                        });
                }
            }
        };



        $scope.setLernFeatureTyp = function(){
            if(!$scope.editLernFeature.typ ||  $scope.editLernFeature.typ == ''){
                $scope.featureValid = false;
                return;
            }

            removeAllFeaturesFromMap();
            $scope.editLernFeature.infoEinheit = '';
            $scope.editLernFeature.feature = '';
            $scope.editLernFeature.plan1 = '';
            $scope.editLernFeature.plan2 = '';
            $scope.editLernFeature.plan3 = '';
            $scope.featureValid = false;
        };

        $scope.setLernFeatureInfoEinheit = function(){
            if(!$scope.editLernFeature.infoEinheit ||  $scope.editLernFeature.infoEinheit == ''){
                $scope.featureValid = false;
                return;
            }

            for(var x in $scope.infoEinheiten){
                if($scope.infoEinheiten[x].id ==  $scope.editLernFeature.infoEinheit){
                    $scope.editLernFeature.title = [$scope.infoEinheiten[x].title];
                    $scope.editLernFeature.start = $scope.infoEinheiten[x].start;
                    $scope.editLernFeature.end = $scope.infoEinheiten[x].end;
                }
            }

            $scope.editLernFeature.feature = '';

            $http.get('/pg/getInfoEinheit/' + $scope.editLernFeature.infoEinheit).
                success(function(data, status, headers, config) {
                    for(var x in data.infoEinheit.features){
                        if( data.infoEinheit.features[x].typ == 'plan') data.infoEinheit.features.splice(x,1);
                    }
                    $scope.feature = data.infoEinheit.features;
                }).
                error(function(data, status, headers, config) {
                    // called asynchronously if an error occurs
                    // or server returns response with an error status.
                });

            removeAllFeaturesFromMap();
            if($scope.editLernFeature.typ == 'infoEinheit'){
                showInfoEinheit($scope.editLernFeature.infoEinheit, false);
                $scope.featureValid = true;
            }

        };

        $scope.setLernFeatureFeature = function(){
            if(!$scope.editLernFeature.feature ||  $scope.editLernFeature.feature == ''){
                $scope.featureValid = false;
                return;
            }

            for(var x in $scope.feature){
                if($scope.feature[x].id ==  $scope.editLernFeature.feature){
                    $scope.editLernFeature.title = [$scope.feature[x].title];
                    if($scope.feature[x].start) $scope.editLernFeature.start = $scope.feature[x].start;
                    if($scope.feature[x].end) $scope.editLernFeature.end = $scope.feature[x].end;
                }
            }

            removeAllFeaturesFromMap();
            showInfoEinheit($scope.editLernFeature.infoEinheit, $scope.editLernFeature.feature);

            $scope.featureValid = true;
        };

        $scope.setLernFeaturePlan1 = function(){
            if(!$scope.editLernFeature.plan1 ||  $scope.editLernFeature.plan1 == ''){
                $scope.featureValid = false;
                return;
            }

            for(var x in $scope.infoEinheiten){
                if($scope.infoEinheiten[x].id ==  $scope.editLernFeature.plan1){
                    $scope.editLernFeature.title = [$scope.infoEinheiten[x].title];
                    $scope.editLernFeature.start = $scope.infoEinheiten[x].start;
                    $scope.editLernFeature.end = $scope.infoEinheiten[x].end;
                    $scope.infoEinheiten.splice(x,1);
                }
            }

            showInfoEinheit($scope.editLernFeature.plan1, false);

        };

        $scope.setLernFeaturePlan2 = function(){
            if(!$scope.editLernFeature.plan1 ||  $scope.editLernFeature.plan1 == ''){
                $scope.featureValid = false;
                return;
            }

            for(var x in $scope.infoEinheiten){
                if($scope.infoEinheiten[x].id ==  $scope.editLernFeature.plan2){
                    $scope.editLernFeature.title.push($scope.infoEinheiten[x].title);
                    if($scope.editLernFeature.start > $scope.infoEinheiten[x].start)
                        $scope.editLernFeature.start = $scope.infoEinheiten[x].start;
                    if($scope.editLernFeature.end < $scope.infoEinheiten[x].end)
                        $scope.editLernFeature.end = $scope.infoEinheiten[x].end;
                    $scope.infoEinheiten.splice(x,1);
                }
            }

            showInfoEinheit($scope.editLernFeature.plan2, false);

            $scope.featureValid = true;
        };

        $scope.setLernFeaturePlan3 = function(){
            if(!$scope.editLernFeature.plan1 ||  $scope.editLernFeature.plan1 == '') return;

            for(var x in $scope.infoEinheiten){
                if($scope.infoEinheiten[x].id ==  $scope.editLernFeature.plan3){
                    $scope.editLernFeature.title.push($scope.infoEinheiten[x].title);
                    if($scope.editLernFeature.start > $scope.infoEinheiten[x].start)
                        $scope.editLernFeature.start = $scope.infoEinheiten[x].start;
                    if($scope.editLernFeature.end < $scope.infoEinheiten[x].end)
                        $scope.editLernFeature.end = $scope.infoEinheiten[x].end;
                }
            }

            showInfoEinheit($scope.editLernFeature.plan3, false);

            $scope.featureValid = true;
        };

        $scope.saveLernFeature = function(){
            if($scope.creatingNewLernFeature){
                $scope.editLernLektion.lernFeature.push($scope.editLernFeature);
            }
            removeAllFeaturesFromMap();
            $scope.editLernFeature = null;
            $scope.featureEditing = false;

        };


        $scope.deleteLernFeature = function(index){

            if($scope.editLernFeature && ($scope.editLernLektion.lernFeature[index].id == $scope.editLernFeature.id)){
                removeAllFeaturesFromMap();
                $scope.editLernFeature = null;
                $scope.featureEditing = false;
            }

            $scope.featuresToDelete.push($scope.editLernLektion.lernFeature[index].id);
            $scope.editLernLektion.lernFeature.splice(index,1);
        };


        $scope.back = function(){
            if($scope.mode == 'editLernEinheit'){
                $scope.topTitle = 'Übersicht';
                $scope.mode = 'list';
            }
            if($scope.mode == 'editLernLektion'){
                removeAllFeaturesFromMap();
                $scope.editLernFeature = null;
                $scope.featureEditing = false;

                $scope.topTitle = 'Lern-Einheit';
                $scope.mode = 'editLernEinheit';
            }
        };


        $scope.saveLernLektion = function(){


            $scope.editLernLektion.start = +99999999;
            $scope.editLernLektion.end = -99999999;

            for(var x in $scope.editLernLektion.lernFeature){
                if($scope.editLernLektion.start > $scope.editLernLektion.lernFeature[x].start)
                    $scope.editLernLektion.start = $scope.editLernLektion.lernFeature[x].start;
                if($scope.editLernLektion.end < $scope.editLernLektion.lernFeature[x].end)
                    $scope.editLernLektion.end = $scope.editLernLektion.lernFeature[x].end;
            }

            if($scope.creatingNewLernLektion){
                $scope.lernLektionen.push($scope.editLernLektion);
            }

            $scope.editLernLektion = null;
            $scope.featureEditing = false;

            $scope.topTitle = 'Lern-Einheit';
            $scope.mode = 'editLernEinheit';
        };

        $scope.save = function(){

            $scope.editLernEinheit.lernLektionen =  $scope.lernLektionen;



            $scope.editLernEinheit.start = +99999999;
            $scope.editLernEinheit.end = -99999999;


            for(var x in $scope.editLernEinheit.lernLektionen){
                if($scope.editLernEinheit.start > $scope.editLernEinheit.lernLektionen[x].start)
                    $scope.editLernEinheit.start = $scope.editLernEinheit.lernLektionen[x].start;
                if($scope.editLernEinheit.end < $scope.editLernEinheit.lernLektionen[x].end)
                    $scope.editLernEinheit.end = $scope.editLernEinheit.lernLektionen[x].end;
            }

            if($scope.creatingNewLernEinheit) $scope.lernEinheiten.push($scope.editLernEinheit);

            $http.post('/pg/saveLernEinheit',$scope.editLernEinheit).
                success(function(data, status, headers, config) {
                    $scope.topTitle = 'Übersicht';
                    $scope.mode = 'list';
                }).
                error(function(data, status, headers, config) {
                    // called asynchronously if an error occurs
                    // or server returns response with an error status.
                });

            for(var x in $scope.featuresToDelete){
                $http.get('/pg/deleteLernFeature/' +$scope.featuresToDelete[x]).
                    success(function(data, status, headers, config) {

                    }).
                    error(function(data, status, headers, config) {
                        // called asynchronously if an error occurs
                        // or server returns response with an error status.
                    });
            }

            for(var x in $scope.lektionenToDelete){
                $http.get('/pg/deleteLernLektion/' +$scope.lektionenToDelete[x]).
                    success(function(data, status, headers, config) {

                    }).
                    error(function(data, status, headers, config) {
                        // called asynchronously if an error occurs
                        // or server returns response with an error status.
                    });
            }

        };



    });
