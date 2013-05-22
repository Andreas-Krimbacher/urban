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

        $scope.newLernLektionTitle = null;
        $scope.editLernLektion = null;
        $scope.creatingNewLernLektion = false;

        $scope.editLernFeature = null;
        $scope.creatingNewLernFeature = false;

        $scope.featureEditing = false;
        $scope.featureValid = false;

        $scope.featuresToDelete = [];
        $scope.lektionenToDelete = [];

        mapInfoEinheit.clearAllLayers();


        //functions to show and hide features in the map -----------------------------------------------------------------

        var showInfoEinheit = function(infoEinheit,selectFeatureId, visibility){


            $http.get('/pg/getInfoEinheit/'+infoEinheit).
                success(function(data) {

                    var infoEinheit = data.infoEinheit;

                    infoEinheit.hasBaseLayer = false;
                    infoEinheit.hasFeatureLayer = false;

                    var selectFeature = null;

                    infoEinheit.lernInfo = $scope.editLernFeature.info;
                    var attr;
                    var x;
                    for(x = 0; x < infoEinheit.features.length; x++){
                        infoEinheit.features[x].lernInfo = $scope.editLernFeature.info;
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
                                    var data = null;
                                    if(feature) data = feature.attributes.element;
                                    $scope.$broadcast('selectFeature',data);
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

                    mapInfoEinheit.addInfoEinheit(infoEinheit,'top');

                    for(x = 0; x < infoEinheit.features.length; x++){
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
                        if(selectFeatureId && infoEinheit.features[x].id == selectFeatureId) selectFeature = infoEinheit.features[x];
                    }

                    infoEinheit.selected = false;

                    var onlyBase = false;
                    if(visibility == 'plan') onlyBase = true;
                    $scope.$broadcast('showLayerInList',{infoEinheit:infoEinheit,mode:'lern',onlyBase:onlyBase});
                    $scope.$broadcast('toogleInfoControlVisibility',{type:'layerlist',state: true});

                    if(selectFeature){
                        //the feature select on the feature layer triggers the 'featureSelected' event
                        if(selectFeature.typ != 'plan' && selectFeature.typ != 'planOverlay') mapInfoEinheit.selectfeature(selectFeature);
                        else $scope.$broadcast('selectFeature',selectFeature);
                    }
                    else{
                        $scope.$broadcast('selectInfoEinheit',infoEinheit);
                    }

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
            success(function(data) {
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
                    success(function(data) {
                        $scope.nextLernLektionId = data.nextLernLektionId;
                        $scope.nextLernFeatureId = data.nextLernFeatureId;

                        $scope.editLernEinheit = data.lernEinheit;

                        $scope.editLernEinheit.lernLektionen.sort(function(a, b){
                            return a.order-b.order;
                        });

                        $scope.lernLektionen = $scope.editLernEinheit.lernLektionen;

                        if($scope.editLernEinheit.info == 'null') $scope.editLernEinheit.info = '';

                        var x;
                        var y;
                        for(x=0; x < $scope.lernLektionen.length; x++){
                            $scope.lernLektionen[x].lernFeature.sort(function(a, b){
                                return a.order-b.order;
                            });
                            for(y = 0; y < $scope.lernLektionen[x].lernFeature.length; y++){
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
                success(function() {
                    $scope.lernEinheiten.splice(index,1);
                }).
                error(function(data, status, headers, config) {
                    // called asynchronously if an error occurs
                    // or server returns response with an error status.
                });

        };

        $scope.editLernLektionMode = function(index){

            $http.get('/pg/getInfoEinheitenList').
                success(function(data) {
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
                $scope.editLernLektion = angular.copy($scope.lernLektionen[index]);
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
                $scope.editLernFeature.infoEinheit = '';
                $scope.editLernFeature.hasBaseLayer = false;
                $scope.editLernFeature.visible = {};

                $scope.topTitle = 'Lern-Feature';
                $scope.mode = 'editLernFeature';
            }
            else{
                $scope.creatingNewLernFeature = false;
                $scope.featureEditing = true;

                var lernFeature = null;
                lernFeature = angular.copy($scope.editLernLektion.lernFeature[index]);

                $timeout(function(){$scope.editLernFeature = lernFeature;});

                //show in Map
                if(lernFeature.typ == 'infoEinheit') showInfoEinheit(lernFeature.infoEinheit,false,lernFeature.visible);
                if(lernFeature.typ == 'feature') showInfoEinheit(lernFeature.infoEinheit,lernFeature.feature,lernFeature.visible);
                if(lernFeature.typ == 'planVgl'){
                    showInfoEinheit(lernFeature.plan1,false, 'plan');
                    showInfoEinheit(lernFeature.plan2,false, 'plan');
                    if(lernFeature.plan3) showInfoEinheit(lernFeature.plan3,false, 'plan');
                }


                if(lernFeature.typ != 'planVgl'){
                    $http.get('/pg/getInfoEinheit/' + lernFeature.infoEinheit).
                        success(function(data) {
                            var x;
                            for(x = 0; x < data.infoEinheit.features.length; x++){
                                if(lernFeature.typ == 'infoEinheit' && data.infoEinheit.features[x].typ == 'plan'){
                                    lernFeature.visible[data.infoEinheit.features[x].id] = true;
                                    data.infoEinheit.features.splice(x,1);
                                    lernFeature.hasBaseLayer = true;
                                }
                            }

                            $scope.feature = data.infoEinheit.features;

                            $scope.featureValid = true;
                        }).
                        error(function(data, status, headers, config) {
                            // called asynchronously if an error occurs
                            // or server returns response with an error status.
                        });

                }
                mapInfoEinheit.setMapView(lernFeature.mapView);

                $scope.topTitle = 'Lern-Feature';
                $scope.mode = 'editLernFeature';
            }
        };



        $scope.setLernFeatureTyp = function(){
            if(!$scope.editLernFeature.typ ||  $scope.editLernFeature.typ == ''){
                $scope.featureValid = false;
                return;
            }

            removeAllFeaturesFromMap();

            angular.copy($scope.origInfoEinheiten, $scope.infoEinheiten);

            $scope.editLernFeature.hasBaseLayer = false;
            $scope.editLernFeature.visible = {};
            $scope.editLernFeature.infoEinheit = '';
            $scope.editLernFeature.feature = null;
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

            var x;
            for(x = 0; x < $scope.infoEinheiten.length; x++){
                if($scope.infoEinheiten[x].id ==  $scope.editLernFeature.infoEinheit){
                    $scope.editLernFeature.title = [$scope.infoEinheiten[x].title];
                    $scope.editLernFeature.start = $scope.infoEinheiten[x].start;
                    $scope.editLernFeature.end = $scope.infoEinheiten[x].end;
                }
            }

            $scope.editLernFeature.feature = null;
            $scope.editLernFeature.hasBaseLayer = false;
            $scope.editLernFeature.visible = {};

            removeAllFeaturesFromMap();

            $http.get('/pg/getInfoEinheit/' + $scope.editLernFeature.infoEinheit).
                success(function(data) {
                    var x;
                    for(x = 0; x < data.infoEinheit.features.length; x++){
                        if($scope.editLernFeature.typ == 'infoEinheit' && data.infoEinheit.features[x].typ == 'plan'){
                            $scope.editLernFeature.visible[data.infoEinheit.features[x].id] = true;
                            data.infoEinheit.features.splice(x,1);
                            $scope.editLernFeature.hasBaseLayer = true;
                        }
                    }
                    for(x = 0; x < data.infoEinheit.features.length; x++){
                        data.infoEinheit.features[x].visible = true;
                        $scope.editLernFeature.visible[data.infoEinheit.features[x].id] = true;
                    }

                    $scope.feature = data.infoEinheit.features;

                    if($scope.editLernFeature.typ == 'feature') $scope.editLernFeature.feature = $scope.feature[0].id;

                    showInfoEinheit($scope.editLernFeature.infoEinheit, $scope.editLernFeature.feature,'all');

                    $scope.featureValid = true;
                }).
                error(function(data, status, headers, config) {
                    // called asynchronously if an error occurs
                    // or server returns response with an error status.
                });
        };

        $scope.selectFeature = function(){
            if(!$scope.editLernFeature.feature ||  $scope.editLernFeature.feature == ''){
                $scope.featureValid = false;
                return;
            }

            var x;
            for(x = 0; x < $scope.feature.length; x++){
                if($scope.feature[x].id ==  $scope.editLernFeature.feature){
                    $scope.editLernFeature.title = [$scope.feature[x].title];
                    if($scope.feature[x].start) $scope.editLernFeature.start = $scope.feature[x].start;
                    if($scope.feature[x].end) $scope.editLernFeature.end = $scope.feature[x].end;
                }
            }

            removeAllFeaturesFromMap();
            showInfoEinheit($scope.editLernFeature.infoEinheit, $scope.editLernFeature.feature,$scope.editLernFeature.visible);

            $scope.featureValid = true;
        };

        $scope.changeVisibility = function(){
            removeAllFeaturesFromMap();
            showInfoEinheit($scope.editLernFeature.infoEinheit, $scope.editLernFeature.feature,$scope.editLernFeature.visible);

        };

        $scope.checkLastVisibleItem = function(id){

            if(!$scope.editLernFeature) return true;

            if(!$scope.editLernFeature.visible[id])  return false;

            var count = 0;
            for(var x in $scope.editLernFeature.visible){
                if($scope.editLernFeature.visible[x]) count++;
            }

            return ((count <= 1) && !$scope.editLernFeature.hasBaseLayer);
        };

        $scope.setLernFeaturePlan1 = function(){
            if(!$scope.editLernFeature.plan1 ||  $scope.editLernFeature.plan1 == ''){
                $scope.featureValid = false;
                return;
            }
            var x;
            for(x = 0; x < $scope.infoEinheiten.length; x++){
                if($scope.infoEinheiten[x].id ==  $scope.editLernFeature.plan1){
                    $scope.editLernFeature.title = [$scope.infoEinheiten[x].title];
                    $scope.editLernFeature.start = $scope.infoEinheiten[x].start;
                    $scope.editLernFeature.end = $scope.infoEinheiten[x].end;

                }
            }

            angular.copy($scope.origInfoEinheiten, $scope.infoEinheiten);
            for(x = $scope.infoEinheiten.length- 1; x >= 0; x--){
                if($scope.infoEinheiten[x].id ==  $scope.editLernFeature.plan1) $scope.infoEinheiten.splice(x,1);
                else if($scope.infoEinheiten[x].id ==  $scope.editLernFeature.plan2) $scope.infoEinheiten.splice(x,1);
                else if($scope.infoEinheiten[x].id ==  $scope.editLernFeature.plan3) $scope.infoEinheiten.splice(x,1);
            }


            removeAllFeaturesFromMap();
            showInfoEinheit($scope.editLernFeature.plan1, false, 'plan');
            if($scope.editLernFeature.plan2 != '') showInfoEinheit($scope.editLernFeature.plan2, false, 'plan');
            if($scope.editLernFeature.plan3 != '') showInfoEinheit($scope.editLernFeature.plan3, false, 'plan');

        };

        $scope.setLernFeaturePlan2 = function(){
            if(!$scope.editLernFeature.plan1 ||  $scope.editLernFeature.plan1 == ''){
                $scope.featureValid = false;
                return;
            }

            var x;
            for(x = 0; x < $scope.infoEinheiten.length; x++){
                if($scope.infoEinheiten[x].id ==  $scope.editLernFeature.plan2){
                    $scope.editLernFeature.title.push($scope.infoEinheiten[x].title);
                    if($scope.editLernFeature.start > $scope.infoEinheiten[x].start)
                        $scope.editLernFeature.start = $scope.infoEinheiten[x].start;
                    if($scope.editLernFeature.end < $scope.infoEinheiten[x].end)
                        $scope.editLernFeature.end = $scope.infoEinheiten[x].end;
                }
            }

            angular.copy($scope.origInfoEinheiten, $scope.infoEinheiten);
            for(x = $scope.infoEinheiten.length- 1; x >= 0; x--){
                if($scope.infoEinheiten[x].id ==  $scope.editLernFeature.plan1) $scope.infoEinheiten.splice(x,1);
                else if($scope.infoEinheiten[x].id ==  $scope.editLernFeature.plan2) $scope.infoEinheiten.splice(x,1);
                else if($scope.infoEinheiten[x].id ==  $scope.editLernFeature.plan3) $scope.infoEinheiten.splice(x,1);
            }

            removeAllFeaturesFromMap();
            showInfoEinheit($scope.editLernFeature.plan1, false, 'plan');
            showInfoEinheit($scope.editLernFeature.plan2, false, 'plan');
            if($scope.editLernFeature.plan3 != '') showInfoEinheit($scope.editLernFeature.plan3, false, 'plan');

            $scope.featureValid = true;
        };

        $scope.setLernFeaturePlan3 = function(){
            if(!$scope.editLernFeature.plan1 ||  $scope.editLernFeature.plan1 == '' || !$scope.editLernFeature.plan2 ||  $scope.editLernFeature.plan2 == '') return;

            var x;
            for(x = 0; x < $scope.infoEinheiten.length; x++){
                if($scope.infoEinheiten[x].id ==  $scope.editLernFeature.plan3){
                    $scope.editLernFeature.title.push($scope.infoEinheiten[x].title);
                    if($scope.editLernFeature.start > $scope.infoEinheiten[x].start)
                        $scope.editLernFeature.start = $scope.infoEinheiten[x].start;
                    if($scope.editLernFeature.end < $scope.infoEinheiten[x].end)
                        $scope.editLernFeature.end = $scope.infoEinheiten[x].end;
                }
            }

            angular.copy($scope.origInfoEinheiten, $scope.infoEinheiten);
            for(x = $scope.infoEinheiten.length- 1; x >= 0; x--){
                if($scope.infoEinheiten[x].id ==  $scope.editLernFeature.plan1) $scope.infoEinheiten.splice(x,1);
                else if($scope.infoEinheiten[x].id ==  $scope.editLernFeature.plan2) $scope.infoEinheiten.splice(x,1);
                else if($scope.infoEinheiten[x].id ==  $scope.editLernFeature.plan3) $scope.infoEinheiten.splice(x,1);
            }

            removeAllFeaturesFromMap();
            showInfoEinheit($scope.editLernFeature.plan1, false, 'plan');
            showInfoEinheit($scope.editLernFeature.plan2, false, 'plan');
            showInfoEinheit($scope.editLernFeature.plan3, false, 'plan');

            $scope.featureValid = true;
        };

        $scope.saveLernFeature = function(){

            $scope.editLernFeature.mapView = mapInfoEinheit.getMapView();

            if($scope.creatingNewLernFeature){
                $scope.editLernLektion.lernFeature.push($scope.editLernFeature);
            }
            else{
                var x;
                for(x = 0; x < $scope.editLernLektion.lernFeature.length; x++){
                    if($scope.editLernLektion.lernFeature[x].id == $scope.editLernFeature.id)
                        $scope.editLernLektion.lernFeature[x] = $scope.editLernFeature;
                }
            }

            removeAllFeaturesFromMap();
            $scope.editLernFeature = null;
            $scope.featureEditing = false;

            $scope.topTitle = 'Lern-Lektion';
            $scope.mode = 'editLernLektion';

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
                $scope.topTitle = 'Lern-Einheit';
                $scope.mode = 'editLernEinheit';
            }
            if($scope.mode == 'editLernFeature'){
                removeAllFeaturesFromMap();
                $scope.editLernFeature = null;
                $scope.featureEditing = false;

                $scope.topTitle = 'Lern-Lektion';
                $scope.mode = 'editLernLektion';
            }
        };


        $scope.saveLernLektion = function(){


            $scope.editLernLektion.start = +99999999;
            $scope.editLernLektion.end = -99999999;

            var x;
            for(x = 0; x < $scope.editLernLektion.lernFeature.length; x++){
                $scope.editLernLektion.lernFeature[x].order = parseInt(x)+1;
                if($scope.editLernLektion.start > $scope.editLernLektion.lernFeature[x].start)
                    $scope.editLernLektion.start = $scope.editLernLektion.lernFeature[x].start;
                if($scope.editLernLektion.end < $scope.editLernLektion.lernFeature[x].end)
                    $scope.editLernLektion.end = $scope.editLernLektion.lernFeature[x].end;
            }

            if($scope.creatingNewLernLektion){
                $scope.lernLektionen.push($scope.editLernLektion);
            }
            else{
                for(x = 0; x < $scope.lernLektionen.length; x++){
                    if($scope.lernLektionen[x].id == $scope.editLernLektion.id)
                        $scope.lernLektionen[x] = $scope.editLernLektion;
                }
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

            var x;
            for(x = 0; x < $scope.editLernEinheit.lernLektionen.length; x++){
                $scope.editLernEinheit.lernLektionen[x].order = parseInt(x)+1;
                if($scope.editLernEinheit.start > $scope.editLernEinheit.lernLektionen[x].start)
                    $scope.editLernEinheit.start = $scope.editLernEinheit.lernLektionen[x].start;
                if($scope.editLernEinheit.end < $scope.editLernEinheit.lernLektionen[x].end)
                    $scope.editLernEinheit.end = $scope.editLernEinheit.lernLektionen[x].end;
            }

            if($scope.creatingNewLernEinheit) $scope.lernEinheiten.push($scope.editLernEinheit);

            $http.post('/pg/saveLernEinheit',$scope.editLernEinheit).
                success(function() {
                    $scope.topTitle = 'Übersicht';
                    $scope.mode = 'list';
                }).
                error(function(data, status, headers, config) {
                    // called asynchronously if an error occurs
                    // or server returns response with an error status.
                });

            for(x = 0; x < $scope.featuresToDelete; x++){
                $http.get('/pg/deleteLernFeature/' +$scope.featuresToDelete[x]).
                    success(function(data, status, headers, config) {

                    }).
                    error(function(data, status, headers, config) {
                        // called asynchronously if an error occurs
                        // or server returns response with an error status.
                    });
            }

            for(x = 0; x < $scope.lektionenToDelete; x++){
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
