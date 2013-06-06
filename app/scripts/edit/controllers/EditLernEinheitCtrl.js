'use strict';
/**
 * Cotroller for the edit Lern-Einheit view, use the mapInfoEinheit service to show Info-Einheiten
 * @name Controller:EditLernEinheitCtrl
 * @namespace
 * @author Andreas Krimbacher
 */
angular.module('udm.edit')
    .controller('EditLernEinheitCtrl', function ($scope,$http,$timeout,mapInfoEinheit,util) {
		/**
         * title for the view
         * @name Controller:EditInfoEinheitCtrl#topTitle
         * @type {string}
         */
        $scope.topTitle = 'Übersicht';
		/**
         * view mode (list, lernEinheit, lernLektion, lernFeature)
         * @name Controller:EditInfoEinheitCtrl#mode
         * @type {string}
         */
        $scope.mode = 'list';

		/**
         * next possible Id for the Lern-Einheit, synced with the server at the getLernEinheitList resquest 
         * @name Controller:EditInfoEinheitCtrl#nextLernEinheitId
         * @type {integer}
         */
        $scope.nextLernEinheitId = null;
		/**
         * next possible Id for the Lern-Lektion, synced with the server at the getLernEinheitList resquest 
         * @name Controller:EditInfoEinheitCtrl#nextLernLektionId
         * @type {integer}
         */
        $scope.nextLernLektionId = null;
		/**
         * next possible Id for the Lern-Feature, synced with the server at the getLernEinheitList resquest 
         * @name Controller:EditInfoEinheitCtrl#nextLernFeatureId
         * @type {integer}
         */
        $scope.nextLernFeatureId = null;

		/**
         * Array of current Lern-Einheiten in list
         * @name Controller:EditInfoEinheitCtrl#lernEinheiten
         * @type {Array(object)}
         */
        $scope.lernEinheiten = [];
		/**
         * Array of current Lern-Lektionen in list
         * @name Controller:EditInfoEinheitCtrl#lernLektionen
         * @type {Array(object)}
         */
        $scope.lernLektionen = [];

		/**
         * Array of all Info-Einheiten on the server
         * @name Controller:EditInfoEinheitCtrl#origInfoEinheiten
         * @type {Array(object)}
         */
        $scope.origInfoEinheiten = [];
		/**
         * Array of all Info-Einheiten on the server, changed during plan selection
         * @name Controller:EditInfoEinheitCtrl#origInfoEinheiten
         * @type {Array(object)}
         */
        $scope.infoEinheiten = [];
		/**
         * Array of current Info-Feature
         * @name Controller:EditInfoEinheitCtrl#feature
         * @type {Array(object)}
         */
        $scope.feature = [];

		/**
         * Lern-Einheit for editing or a new one on creation
         * @name Controller:EditInfoEinheitCtrl#editLernEinheit
         * @type {object}
         */
        $scope.editLernEinheit = {};
		/**
         * Title for a new Lern-Einheit
         * @name Controller:EditInfoEinheitCtrl#newLernEinheitTitle
         * @type {string}
         */
        $scope.newLernEinheitTitle = null;
		/**
         * Flag for creating a new Lern-Einheit
         * @name Controller:EditInfoEinheitCtrl#creatingNewLernEinheit
         * @type {boolean}
         */
        $scope.creatingNewLernEinheit = false;

		/**
         * Lern-Lektion for editing or a new one on creation
         * @name Controller:EditInfoEinheitCtrl#editLernLektion
         * @type {object}
         */
		$scope.editLernLektion = null;
		/**
         * Title for a new Lern-Lektion
         * @name Controller:EditInfoEinheitCtrl#newLernLektionTitle
         * @type {string}
         */
        $scope.newLernLektionTitle = null;
		/**
         * Flag for creating a new Lern-Lektion
         * @name Controller:EditInfoEinheitCtrl#creatingNewLernLektion
         * @type {boolean}
         */
        $scope.creatingNewLernLektion = false;

		/**
         * Lern-Feature for editing or a new one on creation
         * @name Controller:EditInfoEinheitCtrl#editLernFeature
         * @type {object}
         */
        $scope.editLernFeature = null;
		/**
         * Flag for creating a new Lern-Fature
         * @name Controller:EditInfoEinheitCtrl#creatingNewLernFeature
         * @type {boolean}
         */
        $scope.creatingNewLernFeature = false;

		/**
         * Flag for Lern-Fature editing in progress
         * @name Controller:EditInfoEinheitCtrl#featureEditing
         * @type {boolean}
         */
        $scope.featureEditing = false;
		/**
         * Flag for Lern-Fature is valid
         * @name Controller:EditInfoEinheitCtrl#featureValid
         * @type {boolean}
         */
        $scope.featureValid = false;

		/**
         * Array of Lern-Features to delete on the server, deletion is executed on save Lern-Einheit
         * @name Controller:EditInfoEinheitCtrl#featuresToDelete
         * @type {Array(object)}
         */
        $scope.featuresToDelete = [];
		/**
         * Array of Lern-Lektionen to delete on the server, deletion is executed on save Lern-Einheit
         * @name Controller:EditInfoEinheitCtrl#lektionenToDelete
         * @type {Array(object)}
         */
        $scope.lektionenToDelete = [];

		//reset mapEditFeature service
        mapInfoEinheit.clearAllLayers();


        //functions to show and hide features in the map -----------------------------------------------------------------
		/**
         * shows a Lern-Feature by showing the Info-Einheit with the defined settings
         * @name  Controller:EditInfoEinheitCtrl#showInfoEinheit
         * @function
         * @param infoEinheit {integer} Id Info-Einheit
         * @param selectFeatureId {integer} Id Info-Feature
         * @param visibility {object} visibility object, key: Id Info-Feature, value: true/false
         */
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

		/**
         * remnove all Info-Feature from map
         * @name  Controller:EditInfoEinheitCtrl#removeAllFeaturesFromMap
         * @function
         */
        var removeAllFeaturesFromMap = function(){
            mapInfoEinheit.removeAllInfoEinheiten();
            $scope.$broadcast('clearLayerList');
            $scope.$broadcast('toogleInfoControlVisibility',{type:'layerlist',state: false});
            $scope.$broadcast('toogleInfoControlVisibility',{type:'info',state: false});
            $scope.$broadcast('toogleInfoControlVisibility',{type:'imgslider',state: false});
        };
        //--------------------------------------------------------------------------------------------------------------


		//get a list of all Lern-Einheiten on the server
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

		/**
         * edit a Lern-Einheit from the list or create a new one (index = -1)
         * @name  Controller:EditInfoEinheitCtrl#editLernEinheitMode
         * @function
         * @param index {integer} index in lernEinheiten array
         */
        $scope.editLernEinheitMode = function(index){
            if(index == -1){
				//initialize new Lern-Einheit
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
		/**
         * Delete a Lern-Einheit from the database
		 * @name  Controller:EditInfoEinheitCtrl#deleteLernEinheit
         * @function
         * @param index {integer} index in lernEinheiten array
         */
        $scope.deleteLernEinheit = function(index){
            $http.delete('/pg/deleteLernEinheit/'+$scope.lernEinheiten[index].id).
                success(function() {
                    $scope.lernEinheiten.splice(index,1);
                }).
                error(function(data, status, headers, config) {
                    // called asynchronously if an error occurs
                    // or server returns response with an error status.
                });

        };

		/**
         * edit a Lern-Lektion from the list or create a new one (index = -1)
         * @name  Controller:EditInfoEinheitCtrl#editLernLektionMode
         * @function
         * @param index {integer} index in lernLektionen array
         */
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
				//initialize Lern-Lektion
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

		/**
         * Delete a Lern-Lektion, deleted from the database on Lern-Einheit save
		 * @name  Controller:EditInfoEinheitCtrl#deleteLernLektion
         * @function
         * @param index {integer} index in lernLektionen array
         */
        $scope.deleteLernLektion = function(index){
            $scope.lektionenToDelete.push($scope.lernLektionen[index].id);
            $scope.lernLektionen.splice(index,1);
        };

		/**
         * edit a Lern-Feature from the list or create a new one (index = -1)
         * @name  Controller:EditInfoEinheitCtrl#editLernFeatureMode
         * @function
         * @param index {integer} index in lernFeature array
         */
        $scope.editLernFeatureMode = function(index){
            angular.copy($scope.origInfoEinheiten, $scope.infoEinheiten);
            removeAllFeaturesFromMap();
            if(index == -1){
				//initialize Lern-Feature
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


		/**
         * Apply the type change of a Lern-Feature, editLernFeature.typ is changed by the view
		 * @name  Controller:EditInfoEinheitCtrl#setLernFeatureTyp
         * @function
         */
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

		/**
         * set the Info-Einheit for a Lern-Feature based on editLernFeature.infoEinheit
		 * @name  Controller:EditInfoEinheitCtrl#setLernFeatureInfoEinheit
         * @function
         */
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

		/**
         * set the Info-Feature for a Lern-Feature based on editLernFeature.feature
		 * @name  Controller:EditInfoEinheitCtrl#selectFeature
         * @function
         */
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

		/**
         * change the visibility of the features in the map based on editLernFeature.visible
		 * @name  Controller:EditInfoEinheitCtrl#changeVisibility
         * @function
         */
        $scope.changeVisibility = function(){
            removeAllFeaturesFromMap();
            showInfoEinheit($scope.editLernFeature.infoEinheit, $scope.editLernFeature.feature,$scope.editLernFeature.visible);
        };

		/**
         * check if a Info-Feature is the last visible item in the map
		 * @name  Controller:EditInfoEinheitCtrl#checkLastVisibleItem
         * @function
		 * @param id {integer} Id Info-Feature
		 * @returns {boolean} true if the Info-Feature is the last visible item in the map
         */
        $scope.checkLastVisibleItem = function(id){

            if(!$scope.editLernFeature) return true;

            if(!$scope.editLernFeature.visible[id])  return false;

            var count = 0;
            for(var x in $scope.editLernFeature.visible){
                if($scope.editLernFeature.visible[x]) count++;
            }

            return ((count <= 1) && !$scope.editLernFeature.hasBaseLayer);
        };

		/**
         * set the first plan for a Lern-Feature based on editLernFeature.plan1
		 * @name  Controller:EditLernEinheitCtrl#setLernFeaturePlan1
         * @function
         */
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

		/**
         * set the second plan for a Lern-Feature based on editLernFeature.plan2
		 * @name  Controller:EditInfoEinheitCtrl#setLernFeaturePlan2
         * @function
         */
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

		/**
         * set the third plan for a Lern-Feature based on editLernFeature.plan3
		 * @name  Controller:EditInfoEinheitCtrl#setLernFeaturePlan3
         * @function
         */
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

		/**
         * save current Lern-Feature localy, Lern-Feature is send to server on Lern-Einheit save
		 * @name  Controller:EditInfoEinheitCtrl#saveLernFeature
         * @function
         */
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
		/**
         * Delete a Lern-Feature, deleted from the database on Lern-Einheit save
		 * @name  Controller:EditInfoEinheitCtrl#deleteLernFeature
         * @function
         * @param index {integer} index in lernFeature array
         */
        $scope.deleteLernFeature = function(index){

            if($scope.editLernFeature && ($scope.editLernLektion.lernFeature[index].id == $scope.editLernFeature.id)){
                removeAllFeaturesFromMap();
                $scope.editLernFeature = null;
                $scope.featureEditing = false;
            }

            $scope.featuresToDelete.push($scope.editLernLektion.lernFeature[index].id);
            $scope.editLernLektion.lernFeature.splice(index,1);
        };

		/**
         * go one view back (list <- lernEinheit <- lernLektion <- lernFeature)
		 * @name  Controller:EditInfoEinheitCtrl#back
         * @function
         */
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

		/**
         * save current Lern-Lektion localy, Lern-Lektion is send to server on Lern-Einheit save
		 * @name  Controller:EditInfoEinheitCtrl#saveLernLektion
         * @function
         */
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

		/**
         * save current Lern-Einheit, send to server and delete featuresToDelete and lektionenToDelete
		 * @name  Controller:EditInfoEinheitCtrl#save
         * @function
         */
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
                $http.delete('/pg/deleteLernFeature/' +$scope.featuresToDelete[x]).
                    success(function(data, status, headers, config) {

                    }).
                    error(function(data, status, headers, config) {
                        // called asynchronously if an error occurs
                        // or server returns response with an error status.
                    });
            }

            for(x = 0; x < $scope.lektionenToDelete; x++){
                $http.delete('/pg/deleteLernLektion/' +$scope.lektionenToDelete[x]).
                    success(function(data, status, headers, config) {

                    }).
                    error(function(data, status, headers, config) {
                        // called asynchronously if an error occurs
                        // or server returns response with an error status.
                    });
            }
        };
    });
