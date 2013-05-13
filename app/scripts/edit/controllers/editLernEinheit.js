'use strict';

angular.module('udm.edit')
    .controller('EditLernEinheitCtrl', function ($scope,$http,feature, util) {
        $scope.mode = 'list';

        $scope.nextLernEinheitId = null;
        $scope.nextLernLektionId = null;
        $scope.nextLernFeatureId = null;


        $scope.lernEinheiten = [];
        $scope.lernLektionen = [];

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
                    $scope.infoEinheiten = data.list;
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

            if(index == -1){
                $scope.editLernFeature = {};
                $scope.editLernFeature.id = $scope.nextLernFeatureId;
                $scope.nextLernFeatureId++;
                $scope.creatingNewLernFeature = true;
                $scope.featureEditing = true;
            }
            else{
                $scope.creatingNewLernFeature = false;
                $scope.editLernFeature = $scope.editLernLektion.lernFeature[index];
                $scope.featureEditing = true;
            }
        };

        $scope.setLernFeatureTyp = function(){
            if(!$scope.editLernFeature.typ ||  $scope.editLernFeature.typ == ''){
                $scope.featureValid = false;
                return;
            }

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
                    $scope.editLernFeature.infoEinheitData = $scope.infoEinheiten[x];
                }
            }

            $scope.editLernFeature.feature = '';

            $http.get('/pg/getInfoEinheit/' + $scope.editLernFeature.infoEinheit).
                success(function(data, status, headers, config) {
                    $scope.feature = data.infoEinheit.features;
                }).
                error(function(data, status, headers, config) {
                    // called asynchronously if an error occurs
                    // or server returns response with an error status.
                });

            if($scope.editLernFeature.typ == 'infoEinheit') $scope.featureValid = true;

        };

        $scope.setLernFeatureFeature = function(){
            if(!$scope.editLernFeature.feature ||  $scope.editLernFeature.feature == ''){
                $scope.featureValid = false;
                return;
            }

            for(var x in $scope.feature){
                if($scope.feature[x].id ==  $scope.editLernFeature.feature){
                    $scope.editLernFeature.title = [$scope.feature[x].title];
                    $scope.editLernFeature.featureData = $scope.feature[x];
                    if(!$scope.editLernFeature.featureData.start) $scope.editLernFeature.featureData.start = $scope.editLernFeature.infoEinheitData.start;
                    if(!$scope.editLernFeature.featureData.end) $scope.editLernFeature.featureData.end = $scope.editLernFeature.infoEinheitData.end;
                }
            }

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
                    $scope.editLernFeature.plan1Data = $scope.infoEinheiten[x];
                }
            }

        };

        $scope.setLernFeaturePlan2 = function(){
            if(!$scope.editLernFeature.plan1 ||  $scope.editLernFeature.plan1 == ''){
                $scope.featureValid = false;
                return;
            }

            for(var x in $scope.infoEinheiten){
                if($scope.infoEinheiten[x].id ==  $scope.editLernFeature.plan2){
                    $scope.editLernFeature.title.push($scope.infoEinheiten[x].title);
                    $scope.editLernFeature.plan2Data = $scope.infoEinheiten[x];
                }
            }

            $scope.featureValid = true;
        };

        $scope.setLernFeaturePlan3 = function(){
            if(!$scope.editLernFeature.plan1 ||  $scope.editLernFeature.plan1 == '') return;

            for(var x in $scope.infoEinheiten){
                if($scope.infoEinheiten[x].id ==  $scope.editLernFeature.plan3){
                    $scope.editLernFeature.title.push($scope.infoEinheiten[x].title);
                    $scope.editLernFeature.plan3Data = $scope.infoEinheiten[x];
                }
            }

            $scope.featureValid = true;
        };

        $scope.saveLernFeature = function(){
            if($scope.creatingNewLernFeature){
                $scope.editLernLektion.lernFeature.push($scope.editLernFeature);
            }
            $scope.editLernFeature = null;
            $scope.featureEditing = false;

        };


        $scope.deleteLernFeature = function(index){

            if($scope.editLernFeature && ($scope.editLernLektion.lernFeature[index].id == $scope.editLernFeature.id)){
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
                $scope.editLernFeature = null;
                $scope.featureEditing = false;

                $scope.mode = 'editLernEinheit';
            }
        };


        $scope.saveLernLektion = function(){


            $scope.editLernLektion.start = +99999999;
            $scope.editLernLektion.end = -99999999;

            for(var x in $scope.editLernLektion.lernFeature){
                if($scope.editLernLektion.lernFeature[x].typ == 'infoEinheit'){
                    if($scope.editLernLektion.lernFeature[x].infoEinheitData){
                        if($scope.editLernLektion.start > $scope.editLernLektion.lernFeature[x].infoEinheitData.start)
                            $scope.editLernLektion.start = $scope.editLernLektion.lernFeature[x].infoEinheitData.start;
                        if($scope.editLernLektion.end < $scope.editLernLektion.lernFeature[x].infoEinheitData.end)
                            $scope.editLernLektion.end = $scope.editLernLektion.lernFeature[x].infoEinheitData.end;
                    }
                }
                if($scope.editLernLektion.lernFeature[x].typ == 'feature'){
                    if($scope.editLernLektion.lernFeature[x].featureData){
                        if($scope.editLernLektion.start > $scope.editLernLektion.lernFeature[x].featureData.start)
                            $scope.editLernLektion.start = $scope.editLernLektion.lernFeature[x].featureData.start;
                        if($scope.editLernLektion.end < $scope.editLernLektion.lernFeature[x].featureData.end)
                            $scope.editLernLektion.end = $scope.editLernLektion.lernFeature[x].featureData.end;
                    }
                }
                if($scope.editLernLektion.lernFeature[x].typ == 'planVgl'){
                    if($scope.editLernLektion.lernFeature[x].plan1Data){
                        if($scope.editLernLektion.start > $scope.editLernLektion.lernFeature[x].plan1Data.start)
                            $scope.editLernLektion.start = $scope.editLernLektion.lernFeature[x].plan1Data.start;
                        if($scope.editLernLektion.end < $scope.editLernLektion.lernFeature[x].plan1Data.end)
                            $scope.editLernLektion.end = $scope.editLernLektion.lernFeature[x].plan1Data.end;
                        if($scope.editLernLektion.start > $scope.editLernLektion.lernFeature[x].plan2Data.start)
                            $scope.editLernLektion.start = $scope.editLernLektion.lernFeature[x].plan2Data.start;
                        if($scope.editLernLektion.end < $scope.editLernLektion.lernFeature[x].plan2Data.end)
                            $scope.editLernLektion.end = $scope.editLernLektion.lernFeature[x].plan2Data.end;
                        if($scope.editLernLektion.lernFeature[x].plan3Data && $scope.editLernLektion.start > $scope.editLernLektion.lernFeature[x].plan3Data.start)
                            $scope.editLernLektion.start = $scope.editLernLektion.lernFeature[x].plan3Data.start;
                        if($scope.editLernLektion.lernFeature[x].plan3Data && $scope.editLernLektion.end < $scope.editLernLektion.lernFeature[x].plan3Data.end)
                            $scope.editLernLektion.end = $scope.editLernLektion.lernFeature[x].plan3Data.end;
                    }
                }
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
