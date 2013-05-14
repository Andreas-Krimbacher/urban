'use strict';

angular.module('udm.lern')
    .controller('LernCtrl', function ($scope,$http,layers, util) {

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

        var showFeature = function(lernFeature){

            $scope.$broadcast('clearMapView');

            $scope.currentLernFeature = lernFeature;

            if(lernFeature.typ == 'infoEinheit') $scope.$broadcast('showInfoEinheit',{infoEinheit:lernFeature.infoEinheit,feature: false});
            if(lernFeature.typ == 'feature') $scope.$broadcast('showInfoEinheit',{infoEinheit:lernFeature.infoEinheit,feature: lernFeature.feature});
            if(lernFeature.typ == 'planVgl'){
                $scope.$broadcast('showInfoEinheit',{infoEinheit:lernFeature.plan1,feature: false,onlyBase : true});
                $scope.$broadcast('showInfoEinheit',{infoEinheit:lernFeature.plan2,feature: false,onlyBase : true});
                if(lernFeature.plan3) $scope.$broadcast('showInfoEinheit',{infoEinheit:lernFeature.plan3,feature: false,onlyBase : true});
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
