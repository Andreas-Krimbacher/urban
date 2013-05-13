'use strict';

angular.module('udm.edit')
    .controller('EditInfoEinheitCtrl', function ($scope,$http,feature, util) {
        $scope.mode = 'list';

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



        feature.setFeatureLayer();
        feature.setEditLayer();

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
                                feature.setBaseLayer($scope.features[x].feature);
                                $scope.hasBaseLayer = true;
                            }
                            else if($scope.features[x].typ == 'planOverlay'){
                                feature.addOverlayLayer($scope.features[x].feature);
                            }
                            else{
                                $scope.features[x].feature = util.WKTToFeature($scope.features[x].feature);
                                feature.addFeature($scope.features[x].feature);
                            }

                        }

                        $scope.creatingNewInfoEinheit = false;

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
                $scope.editFeature.id = $scope.nextFeatureId;
                $scope.nextFeatureId++;
                $scope.editFeature.plan = '';
                $scope.editFeature.title = $scope.newFeatureTitle;
                $scope.editFeature.feature = null;
                $scope.creatingNewFeature = true;

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
                                feature.removeOverlayLayer($scope.editFeature.feature);
                                feature.setEditOverlayPlanLayer($scope.editFeature.feature);
                            }

                            $scope.creatingNewFeature = false;
                            $scope.mode = 'editFeature';

                        }).
                        error(function(data, status, headers, config) {
                            // called asynchronously if an error occurs
                            // or server returns response with an error status.
                        });

                }
                else{
                    $scope.editFeature =  $scope.features[index];

                    feature.removeFeature($scope.editFeature.feature);
                    feature.addEditFeature($scope.editFeature.feature);

                    $scope.creatingNewFeature = false;
                    $scope.mode = 'editFeature';
                }
            }


        };

        $scope.deleteFeature = function(index){
            if($scope.features[index].typ == 'plan'){
                feature.removeBaseLayer($scope.features[index].feature);
                $scope.hasBaseLayer = false;
            }
            else if($scope.features[index].typ == 'planOverlay'){
                feature.removeOverlayLayer($scope.features[index].feature);
            }
            else{
                feature.removeFeature($scope.features[index].feature);
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
            feature.removeEditOverlayPlanLayer();
            if($scope.editingBaseLayerFeature){
                feature.removeBaseLayer();
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
                    feature.setBaseLayer(plan);
                }
                else{
                    feature.setEditOverlayPlanLayer(plan);
                }

                $scope.editFeature.feature = plan;
            }
        };

        $scope.$on('colorpickerChanged', function (e,value) {
            if(!$scope.editFeature.feature) return;
            $scope.editFeature.color = value.value;
            $scope.editFeature.feature.attributes.color = value.value;
            feature.redrawEditLayer();
        });

        $scope.drawFeature = function(){
            $scope.addProcess = true;
            feature.drawFeature($scope.editFeature.typ, function(element){
                element.attributes.color = $scope.editFeature.color;
                feature.stopDrawFeature($scope.editFeature.typ);
                feature.redrawEditLayer();
                if(!$scope.$$phase) $scope.$apply($scope.editFeature.feature = element,$scope.addProcess = false);
            });

        };

        $scope.cancel = function(){
            if($scope.addProcess){
                feature.stopDrawFeature($scope.editFeature.typ);
                $scope.addProcess = false;
            }
            if($scope.modifyProcess){
                feature.stopModifyFeature();
                $scope.modifyProcess = false
            }
        };

        $scope.removeFeature = function(){
            feature.removeEditFeature();
            feature.stopModifyFeature();
            feature.stopDrawFeature($scope.editFeature.typ);
            $scope.editFeature.feature = null;
            $scope.addProcess = false;
            $scope.modifyProcess = false;
        };

        $scope.modifyFeature = function(){
            if($scope.modifyProcess){
                feature.stopModifyFeature();
                $scope.modifyProcess = false;
            }
            else{
                feature.modifyFeature();
                $scope.modifyProcess = true;
            }
        };


        $scope.back = function(){
            if($scope.mode == 'editInfoEinheit'){
                $scope.mode = 'list';
            }
            if($scope.mode == 'editFeature'){


                feature.removeEditFeature();
                feature.stopModifyFeature();
                feature.stopDrawFeature($scope.editFeature.typ);
                $scope.editFeature.feature = null;
                $scope.addProcess = false;
                $scope.modifyProcess = false;
                feature.removeEditOverlayPlanLayer();

                if($scope.creatingNewFeature && $scope.editFeature.typ == 'plan'){
                    feature.removeBaseLayer();
                    $scope.hasBaseLayer = false;
                }

                $scope.mode = 'editInfoEinheit';
            }
        };


        $scope.save = function(){

            feature.removeBaseLayer();
            $scope.hasBaseLayer = false;
            feature.removeAllOverlayLayer();
            feature.removeAllFeatures();

            $scope.editInfoEinheit.features =  $scope.features;
            for(var x in $scope.editInfoEinheit.features){
                if($scope.editInfoEinheit.features[x].typ != 'plan' && $scope.editInfoEinheit.features[x].typ != 'planOverlay'){
                    $scope.editInfoEinheit.features[x].feature = util.featureToWKT($scope.editInfoEinheit.features[x].feature,$scope.editInfoEinheit.features[x].typ);
                }
            }
            if($scope.creatingNewInfoEinheit) $scope.infoEinheiten.push($scope.editInfoEinheit);

            $http.post('/pg/saveInfoEinheit',$scope.editInfoEinheit).
                success(function(data, status, headers, config) {
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

            feature.stopModifyFeature();
            feature.removeEditFeature();
            $scope.addProcess = false;
            $scope.modifyProcess = false;
            feature.removeEditOverlayPlanLayer();

            if($scope.editFeature.typ == 'plan' || $scope.editFeature.typ == 'planOverlay'){
                for(var x in $scope.editFeature.planList){
                    if($scope.editFeature.plan == $scope.editFeature.planList[x].tileDB) var plan = $scope.editFeature.planList[x];
                }
                $scope.editFeature.feature = plan;
            }

            if($scope.editFeature.typ == 'planOverlay'){
                feature.addOverlayLayer($scope.editFeature.feature);
            }
            else if($scope.editFeature.typ != 'plan'){
                feature.addFeature($scope.editFeature.feature);
            }

            if($scope.creatingNewFeature) $scope.features.push($scope.editFeature);
            if($scope.editFeature.typ == 'plan') $scope.hasBaseLayer = true;


            $scope.mode = 'editInfoEinheit';
        };

        $scope.uploadImg = function(){
            if($scope.mode == 'editInfoEinheit') $scope.setFileUploadTarget({name : 'imageUpload', target : 'imageUpload/' + $scope.editInfoEinheit.id});
            if($scope.mode == 'editFeature') $scope.setFileUploadTarget({name : 'imageUpload', target : 'imageUpload/' + $scope.editInfoEinheit.id + '/' + $scope.editFeature.id});
            $scope.showFileUpload('imageUpload');
        }




    });
