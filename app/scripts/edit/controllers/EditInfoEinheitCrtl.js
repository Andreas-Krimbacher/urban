'use strict';
/**
 * Controller for the Info-EInheit edit view, the controller use the service mapEditFeature
 * @name Controller:EditInfoEinheitCtrl
 * @namespace
 * @author Andreas Krimbacher
 */
angular.module('udm.edit')
    .controller('EditInfoEinheitCtrl',
    /**
     * Represents a book.
     * @constructor
     * @param {string} title - The title of the book.
     * @param {string} author - The author of the book.
     */
    function ($scope,$http,mapEditFeature, util) {
		/**
         * view mode (list, infoEinheit, infoFeature)
         * @name Controller:EditInfoEinheitCtrl#mode
         * @type {string}
         */
        $scope.mode = 'list';
		/**
         * title for the view
         * @name Controller:EditInfoEinheitCtrl#topTitle
         * @type {string}
         */
        $scope.topTitle = 'Übersicht';

		/**
         * next possible Id for the Info-Einheit, synced with the server at the getInfoEinheitenList resquest 
         * @name Controller:EditInfoEinheitCtrl#nextInfoEinheitId
         * @type {integer}
         */
        $scope.nextInfoEinheitId = null;
		/**
         * next possible Id for the Info-Feature, synced with the server at the getInfoEinheitenList resquest 
         * @name Controller:EditInfoEinheitCtrl#nextFeatureId
         * @type {integer}
         */
        $scope.nextFeatureId = null;

		/**
         * Array of current Info-Einheiten in list
         * @name Controller:EditInfoEinheitCtrl#infoEinheiten
         * @type {Array(object)}
         */
        $scope.infoEinheiten = [];
		/**
         * Array of current Info-Feature
         * @name Controller:EditInfoEinheitCtrl#features
         * @type {Array(object)}
         */
        $scope.features = [];

		/**
         * Info-Einheit for editing or a new one on creation
         * @name Controller:EditInfoEinheitCtrl#editInfoEinheit
         * @type {object}
         */
        $scope.editInfoEinheit = {};
		/**
         * Title for a new Info-Einheit
         * @name Controller:EditInfoEinheitCtrl#newInfoEinheitTitle
         * @type {string}
         */
        $scope.newInfoEinheitTitle = null;
		/**
         * Flag for creating a new Info-Einheit
         * @name Controller:EditInfoEinheitCtrl#creatingNewInfoEinheit
         * @type {boolean}
         */
        $scope.creatingNewInfoEinheit = false;
		/**
         * Info-Feature for editing or a new one on creation
         * @name Controller:EditInfoEinheitCtrl#editFeature
         * @type {object}
         */
        $scope.editFeature = {};
		/**
         * Title for a new Info-Feature
         * @name Controller:EditInfoEinheitCtrl#newFeatureTitle
         * @type {string}
         */
        $scope.newFeatureTitle = null;
		/**
         * Flag for creating a new Info-Feature
         * @name Controller:EditInfoEinheitCtrl#creatingNewFeature
         * @type {boolean}
         */
        $scope.creatingNewFeature = false;

		/**
         * Array of Info-Features to delete on the server, deletion is executed on save Info-Einheit
         * @name Controller:EditInfoEinheitCtrl#featuresToDelete
         * @type {Array(object)}
         */
        $scope.featuresToDelete = [];

		/**
         * Flag for editing the baselayer feature
         * @name Controller:EditInfoEinheitCtrl#editingBaseLayerFeature
         * @type {boolean}
         */
        $scope.editingBaseLayerFeature = false;
		/**
         * Flag for Info-Einheit with baselayer
         * @name Controller:EditInfoEinheitCtrl#hasBaseLayer
         * @type {boolean}
         */
        $scope.hasBaseLayer = false;
		/**
         * Flag for adding openlayers feature in progress
         * @name Controller:EditInfoEinheitCtrl#addProcess
         * @type {boolean}
         */
        $scope.addProcess = false;
		/**
         * Flag for modifing openlayers feature in progress
         * @name Controller:EditInfoEinheitCtrl#modifyProcess
         * @type {boolean}
         */
        $scope.modifyProcess = false;

		//reset mapEditFeature service
        mapEditFeature.clearAllLayer();

		//initialize vector feature layer
        mapEditFeature.setFeatureLayer();
		//initialize vector feature editing layer
        mapEditFeature.setEditFeatureLayer();

		//get a list of all Info-Einheiten on the server
        $http.get('/pg/getInfoEinheitenList').
            success(function(data) {
                $scope.nextInfoEinheitId = data.nextInfoEinheitId;
                $scope.nextFeatureId = data.nextFeatureId;
                $scope.infoEinheiten = data.list;
            }).
            error(function(data, status, headers, config) {
                // called asynchronously if an error occurs
                // or server returns response with an error status.
            });

        /**
         * edit a Info-Einheit from the list or create a new one (index = -1)
         * @name  Controller:EditInfoEinheitCtrl#editInfoEinheitMode
         * @function
         * @param index {integer} index in infoEinheiten array
         */
        $scope.editInfoEinheitMode = function(index){
            if(index == -1){
				//initialize new Info-Einheit
                $scope.editInfoEinheit = {};
                $scope.editInfoEinheit.id = $scope.nextInfoEinheitId;
                $scope.nextInfoEinheitId++;
                $scope.editInfoEinheit.rank = 3;
                $scope.editInfoEinheit.title = $scope.newInfoEinheitTitle;
                $scope.features = [];
                $scope.creatingNewInfoEinheit = true;

                $scope.topTitle = 'Info-Einheit';
                $scope.mode = 'editInfoEinheit';
            }
            else{
				//get Info-Einheit data from server
                $http.get('/pg/getInfoEinheit/'+$scope.infoEinheiten[index].id).
                    success(function(data) {
                        $scope.nextFeatureId = data.nextId;
                        $scope.editInfoEinheit = data.infoEinheit;
                        $scope.infoEinheiten[index] = data.infoEinheit;
                        $scope.features = $scope.editInfoEinheit.features;

                        if(data.infoEinheit.info == 'null') data.infoEinheit.info = '';

						//add features to the map
                        var attr;
                        var x;
                        for(x = 0; x < $scope.features.length; x++){
                            if($scope.features[x].info == 'null') $scope.features[x].info = '';

                            if($scope.features[x].typ == 'plan'){
                                $scope.features[x].title = 'Grundplan';
                                mapEditFeature.setBaseLayer($scope.features[x].feature);
                                $scope.hasBaseLayer = true;
                            }
                            else if($scope.features[x].typ == 'planOverlay'){
                                mapEditFeature.addOverlayLayer($scope.features[x].feature);
                            }
                            else{
                                attr = {typ : $scope.features[x].typ};
                                if($scope.features[x].typ == 'pointOri') attr.rot = $scope.features[x].rot;
                                else attr.color = $scope.features[x].color;

                                $scope.features[x].feature = util.WKTToFeature($scope.features[x].feature,attr);
                                mapEditFeature.addFeature($scope.features[x].feature);
                            }

                        }

                        $scope.creatingNewInfoEinheit = false;

                        $scope.topTitle = 'Info-Einheit';
                        $scope.mode = 'editInfoEinheit';

                    }).
                    error(function(data, status, headers, config) {
                        // called asynchronously if an error occurs
                        // or server returns response with an error status.
                    });
            }
        };
        /**
         * Delete a Info-Einheit from the database
		 * @name  Controller:EditInfoEinheitCtrl#editFeatureMode
         * @function
         * @param index {integer} array index of the Info-Einheit in scope.infoEinheit
         */
        $scope.deleteInfoEinheit = function(index){
            $http.delete('/pg/deleteInfoEinheit/'+$scope.infoEinheiten[index].id).
                success(function() {
                    $scope.infoEinheiten.splice(index,1);
                }).
                error(function(data, status, headers, config) {
                    // called asynchronously if an error occurs
                    // or server returns response with an error status.
                });

        };

		/**
         * edit a Info-Feature from the list or create a new one (index = -1)
         * @name  Controller:EditInfoEinheitCtrl#editFeatureMode
         * @function
         * @param index {integer} index in features array
         */
        $scope.editFeatureMode = function(index){

            $scope.editFeature.planList = [];
            $scope.editingBaseLayerFeature = false;

            if(index == -1){
				//initialize Info-Feature
                $scope.editFeature = {};
                $scope.editFeature.color = '#000000';
                $scope.editFeature.rot = 0;
                $scope.editFeature.id = $scope.nextFeatureId;
                $scope.nextFeatureId++;
                $scope.editFeature.plan = '';
                $scope.editFeature.title = $scope.newFeatureTitle;
                $scope.editFeature.feature = null;
                $scope.creatingNewFeature = true;

                $scope.topTitle = 'Info-Feature';
                $scope.mode = 'editFeature';
            }
            else{
				//edit feature
                if($scope.features[index].typ == 'plan') $scope.editingBaseLayerFeature = true;

                if( $scope.features[index].typ == 'plan' || $scope.features[index].typ == 'planOverlay'){
                    $http.get('/fs',{params: {action:'planList'}}).
                        success(function(data) {
                            $scope.editFeature = angular.copy($scope.features[index]);

                            $scope.editFeature.planList = data;

                            $scope.editFeature.plan = $scope.features[index].feature.tileDB;

                            if($scope.editFeature.typ == 'planOverlay'){
                                mapEditFeature.removeOverlayLayer($scope.editFeature.feature);
                                mapEditFeature.setEditOverlayLayer($scope.editFeature.feature);
                            }

                            $scope.creatingNewFeature = false;
                            $scope.topTitle = 'Info-Feature';
                            $scope.mode = 'editFeature';

                        }).
                        error(function(data, status, headers, config) {
                            // called asynchronously if an error occurs
                            // or server returns response with an error status.
                        });

                }
                else{
                    $scope.editFeature =  {};
                    for(var x in $scope.features[index]){
                        if(x == 'img'){
                            $scope.editFeature.ing = angular.copy($scope.features[index].img);
                        }
                        else if(x == 'feature'){
                            $scope.editFeature.feature = $scope.features[index].feature.clone();
                        }
                        else{
                            $scope.editFeature[x] = $scope.features[index][x];
                        }
                    }

                    if($scope.editFeature.typ == 'pointOri'){
                        $scope.editFeature.feature.attributes.rot = $scope.editFeature.rot;
                    }

                    mapEditFeature.removeFeature($scope.features[index].feature);
                    mapEditFeature.addEditFeature($scope.editFeature);

                    $scope.creatingNewFeature = false;
                    $scope.topTitle = 'Info-Feature';
                    $scope.mode = 'editFeature';
                }
            }

        };

		/**
         * Delete a Info-Feature, deleted from the database on Info-Einheit save
		 * @name  Controller:EditInfoEinheitCtrl#deleteFeature
         * @function
         * @param index {integer} index in features array
         */
        $scope.deleteFeature = function(index){
            if($scope.features[index].typ == 'plan'){
                mapEditFeature.removeBaseLayer();
                $scope.hasBaseLayer = false;
            }
            else if($scope.features[index].typ == 'planOverlay'){
                mapEditFeature.removeOverlayLayer($scope.features[index].feature);
            }
            else{
                mapEditFeature.removeFeature($scope.features[index].feature);
            }
            $scope.featuresToDelete.push($scope.features[index].id);
            $scope.features.splice(index,1);
        };

		/**
         * Apply the type change of a Info-Feature, editFeature.typ is changed by the view
		 * @name  Controller:EditInfoEinheitCtrl#typChange
         * @function
         */
        $scope.typChange = function(){

            if( $scope.editFeature.typ == 'plan' || $scope.editFeature.typ == 'planOverlay'){

                if($scope.editFeature.typ == 'plan') $scope.editFeature.title = 'Grundplan';

                $http.get('/fs',{params: {action:'planList'}}).
                    success(function(data) {
                        $scope.editFeature.planList = data;
                    }).
                    error(function(data, status, headers, config) {
                        // called asynchronously if an error occurs
                        // or server returns response with an error status.
                    });
            }

            $scope.removeFeature();
            mapEditFeature.removeEditOverlayLayer();
            if($scope.editingBaseLayerFeature){
                mapEditFeature.removeBaseLayer();
                $scope.hasBaseLayer = false;
            }

            $scope.editFeature.plan = '';
            $scope.editFeature.feature = null;

            if($scope.editFeature.typ == 'pointOri') $scope.editFeature.rot = 0;

            if($scope.editFeature.typ == 'plan' && $scope.hasBaseLayer){
                alert('nur ein Base Layer möglich');
                $scope.editFeature.typ = '';
                return;
            }
            if($scope.editFeature.typ == 'planOverlay' && !$scope.hasBaseLayer){
                alert('es wird ein Base Layer benötigt');
                $scope.editFeature.typ = '';
                return;
            }

            if($scope.editFeature.typ == 'plan') $scope.editingBaseLayerFeature = true;
        };

		/**
         * change the baseplan or the overlayplan
		 * @name  Controller:EditInfoEinheitCtrl#changePlan
         * @function
         */
        $scope.changePlan = function(){
            if($scope.editFeature.plan){
                var x;
                for(x = 0; x < $scope.editFeature.planList.length; x++){
                    if($scope.editFeature.plan == $scope.editFeature.planList[x].tileDB) var plan = $scope.editFeature.planList[x];
                }

                if($scope.editFeature.typ == 'plan'){
                    mapEditFeature.setBaseLayer(plan);
                }
                else{
                    mapEditFeature.setEditOverlayLayer(plan);
                }

                $scope.editFeature.feature = plan;
            }
        };

		/**
         * apply colorpicker change to the Info-Feature
		 * @name  Controller:EditInfoEinheitCtrl#colorpickerChanged
         * @event
		 * @param value {object} {value:value}
         */
        $scope.$on('colorpickerChanged', function (e,value) {
            $scope.editFeature.color = value.value;
            if($scope.editFeature.feature){
                $scope.editFeature.feature.attributes.color = value.value;
                mapEditFeature.redrawEditFeatureLayer();
            }
        });

		/**
         * apply slider change to the Info-Feature (for oriented points)
		 * @name  Controller:EditInfoEinheitCtrl#sliderChanged
         * @event
		 * @param value {object} {value:value}
         */
        $scope.$on('sliderChanged', function(e,value) {
            if(value.name == 'rot'){
                $scope.editFeature.rot = value.value;
                if($scope.editFeature.feature){
                    $scope.editFeature.feature.attributes.rot = value.value;
                    mapEditFeature.redrawEditFeatureLayer();
                }
            }
        });

		/**
         * start add feature process
		 * @name  Controller:EditInfoEinheitCtrl#drawFeature
         * @function
         */
        $scope.drawFeature = function(){
            $scope.addProcess = true;

            if($scope.editFeature.typ == 'pointOri') var colorRot = $scope.editFeature.rot;
            else colorRot = $scope.editFeature.color;

            mapEditFeature.drawFeature($scope.editFeature.typ,colorRot, function(element){
                element.attributes.typ = $scope.editFeature.typ;
                if($scope.editFeature.typ == 'pointOri'){
                    element.attributes.rot = $scope.editFeature.rot;
                }
                else{
                    element.attributes.color = $scope.editFeature.color;
                }
                mapEditFeature.stopDrawFeature($scope.editFeature.typ);
                mapEditFeature.redrawEditFeatureLayer();
                if(!$scope.$$phase) $scope.$apply($scope.editFeature.feature = element,$scope.addProcess = false);
            });

        };

		/**
         * cancel add feature process
		 * @name  Controller:EditInfoEinheitCtrl#cancel
         * @function
         */
        $scope.cancel = function(){
            if($scope.addProcess){
                mapEditFeature.stopDrawFeature($scope.editFeature.typ);
                $scope.addProcess = false;
            }
            if($scope.modifyProcess){
                mapEditFeature.stopModifyFeature();
                $scope.modifyProcess = false
            }
        };

		/**
         * remove openlayers feature
		 * @name  Controller:EditInfoEinheitCtrl#removeFeature
         * @function
         */
        $scope.removeFeature = function(){
            mapEditFeature.removeAllEditFeature();
            mapEditFeature.stopModifyFeature();
            mapEditFeature.stopDrawFeature($scope.editFeature.typ);
            $scope.editFeature.feature = null;
            $scope.addProcess = false;
            $scope.modifyProcess = false;
        };

		/**
         * modify openlayers feature
		 * @name  Controller:EditInfoEinheitCtrl#modifyFeature
         * @function
         */
        $scope.modifyFeature = function(){
            if($scope.modifyProcess){
                mapEditFeature.stopModifyFeature();
                $scope.modifyProcess = false;
            }
            else{
                mapEditFeature.modifyFeature($scope.editFeature.feature);
                $scope.modifyProcess = true;
            }
        };

		/**
         * go one view back (list <- infoEinheit <- infoFeature)
		 * @name  Controller:EditInfoEinheitCtrl#back
         * @function
         */
        $scope.back = function(){

            if($scope.mode == 'editInfoEinheit'){

                mapEditFeature.removeBaseLayer();
                $scope.hasBaseLayer = false;
                mapEditFeature.removeAllOverlayLayer();
                mapEditFeature.removeAllFeatures();

                $scope.topTitle = 'Übersicht';
                $scope.mode = 'list';
            }
            if($scope.mode == 'editFeature'){


                mapEditFeature.removeAllEditFeature();
                mapEditFeature.stopModifyFeature();
                mapEditFeature.stopDrawFeature($scope.editFeature.typ);
                $scope.addProcess = false;
                $scope.modifyProcess = false;
                mapEditFeature.removeEditOverlayLayer();

                if($scope.creatingNewFeature && $scope.editFeature.typ == 'plan'){
                    mapEditFeature.removeBaseLayer();
                    $scope.hasBaseLayer = false;
                }
                else{
                    var x;
                    for(x = 0; x < $scope.features.length; x++){
                        if($scope.editFeature.id == $scope.features[x].id){
                            if( $scope.features[x].typ == 'plan'){
                                mapEditFeature.setBaseLayer($scope.features[x].feature);
                            }
                            else if( $scope.features[x].typ == 'planOverlay'){
                                mapEditFeature.addOverlayLayer($scope.features[x].feature);
                            }
                            else{
                                mapEditFeature.addFeature($scope.features[x].feature);
                            }
                        }
                    }
                }


                $scope.topTitle = 'Info-Einheit';
                $scope.mode = 'editInfoEinheit';
            }
        };

		/**
         * save current Info-Einheit, send to server and delete featuresToDelete
		 * @name  Controller:EditInfoEinheitCtrl#save
         * @function
         */
        $scope.save = function(){

            mapEditFeature.removeBaseLayer();
            $scope.hasBaseLayer = false;
            mapEditFeature.removeAllOverlayLayer();
            mapEditFeature.removeAllFeatures();

            if(!$scope.editInfoEinheit.end) $scope.editInfoEinheit.end = $scope.editInfoEinheit.start + 1;

            $scope.editInfoEinheit.features =  $scope.features;
            var x;
            for(x = 0; x < $scope.editInfoEinheit.features.length; x++){
                if($scope.editInfoEinheit.features[x].typ == 'plan'){
                    $scope.editInfoEinheit.features[x].title = $scope.editInfoEinheit.title;
                }
                if($scope.editInfoEinheit.features[x].typ != 'plan' && $scope.editInfoEinheit.features[x].typ != 'planOverlay'){
                    $scope.editInfoEinheit.features[x].feature = util.featureToWKT($scope.editInfoEinheit.features[x].feature);
                }
            }
            if($scope.creatingNewInfoEinheit) $scope.infoEinheiten.push($scope.editInfoEinheit);

            $http.post('/pg/saveInfoEinheit',$scope.editInfoEinheit).
                success(function() {
                    $scope.topTitle = 'Übersicht';
                    $scope.mode = 'list';
                }).
                error(function(data, status, headers, config) {
                    // called asynchronously if an error occurs
                    // or server returns response with an error status.
                });

            for(x=0; x < $scope.featuresToDelete.length; x++){
                $http.delete('/pg/deleteFeature/' + $scope.editInfoEinheit.id + '/' +$scope.featuresToDelete[x]).
                    success(function(data, status, headers, config) {

                    }).
                    error(function(data, status, headers, config) {
                        // called asynchronously if an error occurs
                        // or server returns response with an error status.
                    });
            }
        };

		/**
         * save current Info-Feature localy, Info-Feature is send to server on Info-Einheit save
		 * @name  Controller:EditInfoEinheitCtrl#saveFeature
         * @function
         */
        $scope.saveFeature = function(){

            mapEditFeature.stopModifyFeature();
            mapEditFeature.removeAllEditFeature();
            $scope.addProcess = false;
            $scope.modifyProcess = false;
            mapEditFeature.removeEditOverlayLayer();

            var x;
            if($scope.editFeature.typ == 'plan' || $scope.editFeature.typ == 'planOverlay'){
                for(x = 0; x < $scope.editFeature.planList.length; x++){
                    if($scope.editFeature.plan == $scope.editFeature.planList[x].tileDB) var plan = $scope.editFeature.planList[x];
                }
                $scope.editFeature.feature = plan;
            }

            if($scope.editFeature.typ == 'planOverlay'){
                mapEditFeature.addOverlayLayer($scope.editFeature.feature);
            }
            else if($scope.editFeature.typ != 'plan'){
                mapEditFeature.addFeature($scope.editFeature.feature);
            }

            if($scope.creatingNewFeature){
                $scope.features.push($scope.editFeature);
            }
            else{
                for(x = 0; x < $scope.features.length; x++){
                    if($scope.editFeature.id == $scope.features[x].id){
                        $scope.features[x] = $scope.editFeature;
                    }
                }
            }

            if($scope.editFeature.typ == 'plan') $scope.hasBaseLayer = true;

            $scope.topTitle = 'Info-Einheit';
            $scope.mode = 'editInfoEinheit';
        };

		/**
         * start image upload
		 * @name  Controller:EditInfoEinheitCtrl#uploadImg
         * @function
         */
        $scope.uploadImg = function(){
            if($scope.mode == 'editInfoEinheit') $scope.setFileUploadTarget({name : 'imageUpload', target : 'imageUpload/' + $scope.editInfoEinheit.id});
            if($scope.mode == 'editFeature') $scope.setFileUploadTarget({name : 'imageUpload', target : 'imageUpload/' + $scope.editInfoEinheit.id + '/' + $scope.editFeature.id});
            $scope.showFileUpload('imageUpload');
        }
    });
