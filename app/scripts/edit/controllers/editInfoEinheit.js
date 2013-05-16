'use strict';

angular.module('udm.edit')
    .controller('EditInfoEinheitCtrl', function ($scope,$http,mapEditFeature, util) {
        $scope.mode = 'list';
        $scope.topTitle = 'Übersicht'

        $scope.nextInfoEinheitId = null;
        $scope.nextFeatureId = null;

        $scope.infoEinheiten = [];
        $scope.features = [];

        $scope.editInfoEinheit = {};
        $scope.newInfoEinheitTitle = null;
        $scope.creatingNewInfoEinheit = false;

        $scope.editFeature = {};
        $scope.newFeatureTitle = null;
        $scope.creatingNewFeature = false;

        $scope.featuresToDelete = [];

        $scope.editingBaseLayerFeature = false;
        $scope.hasBaseLayer = false;

        $scope.addProcess = false;
        $scope.modifyProcess = false;

        mapEditFeature.clearAllLayer();

        mapEditFeature.setFeatureLayer();
        mapEditFeature.setEditLayer();

        $http.get('/pg/getInfoEinheitenList').
            success(function(data, status, headers, config) {
                $scope.nextInfoEinheitId = data.nextInfoEinheitId;
                $scope.nextFeatureId = data.nextFeatureId;
                $scope.infoEinheiten = data.list;
            }).
            error(function(data, status, headers, config) {
                // called asynchronously if an error occurs
                // or server returns response with an error status.
            });


        $scope.editInfoEinheitMode = function(index){
            if(index == -1){
                $scope.editInfoEinheit = {};
                $scope.editInfoEinheit.id = $scope.nextInfoEinheitId;
                $scope.nextInfoEinheitId++;
                $scope.editInfoEinheit.rank = 3;
                $scope.editInfoEinheit.title = $scope.newInfoEinheitTitle;
                $scope.features = [];
                $scope.creatingNewInfoEinheit = true;

                $scope.topTitle = 'Info-Einheit'
                $scope.mode = 'editInfoEinheit';
            }
            else{

                $http.get('/pg/getInfoEinheit/'+$scope.infoEinheiten[index].id).
                    success(function(data, status, headers, config) {
                        $scope.nextFeatureId = data.nextId;
                        $scope.editInfoEinheit = data.infoEinheit;
                        $scope.infoEinheiten[index] = data.infoEinheit;
                        $scope.features = $scope.editInfoEinheit.features;

                        if(data.infoEinheit.info == 'null') data.infoEinheit.info = '';

                        for(var x in $scope.features){
                            if($scope.features[x].info == 'null') $scope.features[x].info = '';

                            if($scope.features[x].typ == 'plan'){
                                mapEditFeature.setBaseLayer($scope.features[x].feature);
                                $scope.hasBaseLayer = true;
                            }
                            else if($scope.features[x].typ == 'planOverlay'){
                                mapEditFeature.addOverlayLayer($scope.features[x].feature);
                            }
                            else{
                                $scope.features[x].feature = util.WKTToFeature($scope.features[x].feature);
                                mapEditFeature.addFeature($scope.features[x].feature);
                            }

                        }

                        $scope.creatingNewInfoEinheit = false;

                        $scope.topTitle = 'Info-Einheit'
                        $scope.mode = 'editInfoEinheit';

                    }).
                    error(function(data, status, headers, config) {
                        // called asynchronously if an error occurs
                        // or server returns response with an error status.
                    });
            }
        };

        $scope.deleteInfoEinheit = function(index){
            $http.get('/pg/deleteInfoEinheit/'+$scope.infoEinheiten[index].id).
                success(function(data, status, headers, config) {
                    $scope.infoEinheiten.splice(index,1);
                }).
                error(function(data, status, headers, config) {
                    // called asynchronously if an error occurs
                    // or server returns response with an error status.
                });

        };

        $scope.editFeatureMode = function(index){

            $scope.editFeature.planList = [];
            $scope.editingBaseLayerFeature = false;

            if(index == -1){
                $scope.editFeature = {};
                $scope.editFeature.color = '#7ad674';
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

                if($scope.features[index].typ == 'plan') $scope.editingBaseLayerFeature = true;

                if( $scope.features[index].typ == 'plan' || $scope.features[index].typ == 'planOverlay'){
                    $http.get('/fs',{params: {action:'planList'}}).
                        success(function(data, status, headers, config) {
                            $scope.editFeature =  $scope.features[index];

                            $scope.editFeature.planList = data;

                            $scope.editFeature.plan = $scope.features[index].feature.tileDB;

                            if($scope.editFeature.typ == 'planOverlay'){
                                mapEditFeature.removeOverlayLayer($scope.editFeature.feature);
                                mapEditFeature.setEditOverlayPlanLayer($scope.editFeature.feature);
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
                    $scope.editFeature =  $scope.features[index];

                    if($scope.editFeature.typ == 'pointOri'){
                        $scope.editFeature.feature.attributes.rot = $scope.editFeature.rot;
                    }

                    mapEditFeature.removeFeature($scope.editFeature.feature);
                    mapEditFeature.addEditFeature($scope.editFeature);

                    $scope.creatingNewFeature = false;
                    $scope.topTitle = 'Info-Feature';
                    $scope.mode = 'editFeature';
                }
            }

            $scope.$on('sliderChanged', function(e,value) {
                    if(value.name == 'rot'){
                        $scope.editFeature.rot = value.value;
                        $scope.editFeature.feature.attributes.rot = value.value;
                        mapEditFeature.redrawEditLayer();
                    }
            });
        };

        $scope.deleteFeature = function(index){
            if($scope.features[index].typ == 'plan'){
                mapEditFeature.removeBaseLayer($scope.features[index].feature);
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

        $scope.typChange = function(){

            if( $scope.editFeature.typ == 'plan' || $scope.editFeature.typ == 'planOverlay'){
                $http.get('/fs',{params: {action:'planList'}}).
                    success(function(data, status, headers, config) {
                        $scope.editFeature.planList = data;
                    }).
                    error(function(data, status, headers, config) {
                        // called asynchronously if an error occurs
                        // or server returns response with an error status.
                    });
            }

            $scope.removeFeature();
            mapEditFeature.removeEditOverlayPlanLayer();
            if($scope.editingBaseLayerFeature){
                mapEditFeature.removeBaseLayer();
                $scope.hasBaseLayer = false;
            }

            $scope.editFeature.plan = '';
            $scope.editFeature.feature = null;



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

        $scope.changePlan = function(){
            if($scope.editFeature.plan){

                for(var x in $scope.editFeature.planList){
                    if($scope.editFeature.plan == $scope.editFeature.planList[x].tileDB) var plan = $scope.editFeature.planList[x];
                }

                if($scope.editFeature.typ == 'plan'){
                    mapEditFeature.setBaseLayer(plan);
                }
                else{
                    mapEditFeature.setEditOverlayPlanLayer(plan);
                }

                $scope.editFeature.feature = plan;
            }
        };

        $scope.$on('colorpickerChanged', function (e,value) {
            if(!$scope.editFeature.feature) return;
            $scope.editFeature.color = value.value;
            $scope.editFeature.feature.attributes.color = value.value;
            mapEditFeature.redrawEditLayer();
        });

        $scope.drawFeature = function(){
            $scope.addProcess = true;
            mapEditFeature.drawFeature($scope.editFeature.typ, function(element){
                element.attributes.typ = $scope.editFeature.typ;
                if($scope.editFeature.typ == 'pointOri'){
                    element.attributes.rot = $scope.editFeature.rot;
                }
                else{
                    element.attributes.color = $scope.editFeature.color;
                }
                mapEditFeature.stopDrawFeature($scope.editFeature.typ);
                mapEditFeature.redrawEditLayer();
                if(!$scope.$$phase) $scope.$apply($scope.editFeature.feature = element,$scope.addProcess = false);
            });

        };

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

        $scope.removeFeature = function(){
            mapEditFeature.removeEditFeature();
            mapEditFeature.stopModifyFeature();
            mapEditFeature.stopDrawFeature($scope.editFeature.typ);
            $scope.editFeature.feature = null;
            $scope.addProcess = false;
            $scope.modifyProcess = false;
        };

        $scope.modifyFeature = function(){
            if($scope.modifyProcess){
                mapEditFeature.stopModifyFeature();
                $scope.modifyProcess = false;
            }
            else{
                mapEditFeature.modifyFeature();
                $scope.modifyProcess = true;
            }
        };


        $scope.back = function(){

            if($scope.mode == 'editInfoEinheit'){
                $scope.topTitle = 'Übersicht';
                $scope.mode = 'list';
            }
            if($scope.mode == 'editFeature'){


                mapEditFeature.removeEditFeature();
                mapEditFeature.stopModifyFeature();
                mapEditFeature.stopDrawFeature($scope.editFeature.typ);
                //$scope.editFeature.feature = null;
                $scope.addProcess = false;
                $scope.modifyProcess = false;
                mapEditFeature.removeEditOverlayPlanLayer();

                if($scope.creatingNewFeature && $scope.editFeature.typ == 'plan'){
                    mapEditFeature.removeBaseLayer();
                    $scope.hasBaseLayer = false;
                }

                $scope.topTitle = 'Info-Einheit';
                $scope.mode = 'editInfoEinheit';
            }
        };


        $scope.save = function(){

            mapEditFeature.removeBaseLayer();
            $scope.hasBaseLayer = false;
            mapEditFeature.removeAllOverlayLayer();
            mapEditFeature.removeAllFeatures();

            $scope.editInfoEinheit.features =  $scope.features;
            for(var x in $scope.editInfoEinheit.features){
                if($scope.editInfoEinheit.features[x].typ != 'plan' && $scope.editInfoEinheit.features[x].typ != 'planOverlay'){
                    $scope.editInfoEinheit.features[x].feature = util.featureToWKT($scope.editInfoEinheit.features[x].feature,$scope.editInfoEinheit.features[x].typ);
                }
            }
            if($scope.creatingNewInfoEinheit) $scope.infoEinheiten.push($scope.editInfoEinheit);

            $http.post('/pg/saveInfoEinheit',$scope.editInfoEinheit).
                success(function(data, status, headers, config) {
                    $scope.topTitle = 'Übersicht';
                    $scope.mode = 'list';
                }).
                error(function(data, status, headers, config) {
                    // called asynchronously if an error occurs
                    // or server returns response with an error status.
                });

            for(var x in $scope.featuresToDelete){
                $http.get('/pg/deleteFeature/' + $scope.editInfoEinheit.id + '/' +$scope.featuresToDelete[x]).
                    success(function(data, status, headers, config) {

                    }).
                    error(function(data, status, headers, config) {
                        // called asynchronously if an error occurs
                        // or server returns response with an error status.
                    });
            }
        };

        $scope.saveFeature = function(){

            mapEditFeature.stopModifyFeature();
            mapEditFeature.removeEditFeature();
            $scope.addProcess = false;
            $scope.modifyProcess = false;
            mapEditFeature.removeEditOverlayPlanLayer();

            if($scope.editFeature.typ == 'plan' || $scope.editFeature.typ == 'planOverlay'){
                for(var x in $scope.editFeature.planList){
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

            if($scope.creatingNewFeature) $scope.features.push($scope.editFeature);
            if($scope.editFeature.typ == 'plan') $scope.hasBaseLayer = true;

            $scope.topTitle = 'Info-Einheit';
            $scope.mode = 'editInfoEinheit';
        };

        $scope.uploadImg = function(){
            if($scope.mode == 'editInfoEinheit') $scope.setFileUploadTarget({name : 'imageUpload', target : 'imageUpload/' + $scope.editInfoEinheit.id});
            if($scope.mode == 'editFeature') $scope.setFileUploadTarget({name : 'imageUpload', target : 'imageUpload/' + $scope.editInfoEinheit.id + '/' + $scope.editFeature.id});
            $scope.showFileUpload('imageUpload');
        }




    });
