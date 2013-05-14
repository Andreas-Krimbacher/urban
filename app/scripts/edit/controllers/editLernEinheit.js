'use strict';

angular.module('udm.edit')
    .controller('EditLernEinheitCtrl', function ($scope,$http,feature,$timeout, util) {
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

                $scope.mode = 'editLernLektion';
            }
            else{
                $scope.creatingNewLernLektion = false;
                $scope.editLernLektion = $scope.lernLektionen[index];
                $scope.editLernFeature = null;
                $scope.featureEditing = false;

                $scope.mode = 'editLernLektion';
            }
        };

        $scope.deleteLernLektion = function(index){
            $scope.lektionenToDelete.push($scope.lernLektionen[index].id);
            $scope.lernLektionen.splice(index,1);
        };

        $scope.editLernFeatureMode = function(index){
            angular.copy($scope.origInfoEinheiten, $scope.infoEinheiten);
            $scope.clearMapView();
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
                if(lernFeature.typ == 'infoEinheit') $scope.showInfoEinheitInMap({infoEinheit:lernFeature.infoEinheit,feature: false});
                if(lernFeature.typ == 'feature') $scope.showInfoEinheitInMap({infoEinheit:lernFeature.infoEinheit,feature: lernFeature.feature});
                if(lernFeature.typ == 'planVgl'){
                    $scope.showInfoEinheitInMap({infoEinheit:lernFeature.plan1,feature: false,onlyBase : true});
                    $scope.showInfoEinheitInMap({infoEinheit:lernFeature.plan2,feature: false,onlyBase : true});
                    if(lernFeature.plan3) $scope.showInfoEinheitInMap({infoEinheit:lernFeature.plan3,feature: false,onlyBase : true});
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

            $scope.clearMapView();
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

            $scope.clearMapView();
            if($scope.editLernFeature.typ == 'infoEinheit'){
                $scope.showInfoEinheitInMap({infoEinheit:$scope.editLernFeature.infoEinheit,feature: false});
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

            $scope.clearMapView();
            $scope.showInfoEinheitInMap({infoEinheit:$scope.editLernFeature.infoEinheit,feature: $scope.editLernFeature.feature});

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

            $scope.showInfoEinheitInMap({infoEinheit:$scope.editLernFeature.plan1,feature: false,onlyBase : true});

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

            $scope.showInfoEinheitInMap({infoEinheit:$scope.editLernFeature.plan2,feature: false,onlyBase : true});

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

            $scope.showInfoEinheitInMap({infoEinheit:$scope.editLernFeature.plan3,feature: false,onlyBase : true});

            $scope.featureValid = true;
        };

        $scope.saveLernFeature = function(){
            if($scope.creatingNewLernFeature){
                $scope.editLernLektion.lernFeature.push($scope.editLernFeature);
            }
            $scope.clearMapView();
            $scope.editLernFeature = null;
            $scope.featureEditing = false;

        };


        $scope.deleteLernFeature = function(index){

            if($scope.editLernFeature && ($scope.editLernLektion.lernFeature[index].id == $scope.editLernFeature.id)){
                $scope.clearMapView();
                $scope.editLernFeature = null;
                $scope.featureEditing = false;
            }

            $scope.featuresToDelete.push($scope.editLernLektion.lernFeature[index].id);
            $scope.editLernLektion.lernFeature.splice(index,1);
        };


        $scope.back = function(){
            if($scope.mode == 'editLernEinheit'){
                $scope.mode = 'list';
            }
            if($scope.mode == 'editLernLektion'){
                $scope.clearMapView();
                $scope.editLernFeature = null;
                $scope.featureEditing = false;

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
