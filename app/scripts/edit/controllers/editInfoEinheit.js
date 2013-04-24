'use strict';

angular.module('udm.edit')
    .controller('EditInfoEinheitCtrl', function ($scope,$http) {
        $scope.mode = 'editInfoEinheit';

        $scope.infoEinheiten = [];

        $http.get('/pg/getInfoEinheitenList').
            success(function(data, status, headers, config) {
                $scope.infoEinheiten = data;
            }).
            error(function(data, status, headers, config) {
                // called asynchronously if an error occurs
                // or server returns response with an error status.
            });

        $scope.editInfoEinheit = {};

        $scope.editInfoEinheit.rank = 3;
        $scope.editInfoEinheit.features = [{title:'asf',type:'base',start: 1980,end: 1980},{title:'asf',type:'feature',start: 1980,end: 1980}]
        $scope.newInfoEinheit = function(){

            $scope.mode = 'editInfoEinheit';
        }

        $scope.back = function(){
            if($scope.mode == 'editInfoEinheit'){

                $scope.mode = 'list'

            }

        }

        $scope.save = function(){
            alert('yes');
        }

        $scope.infoEinheiten = [{title:'Plan des Artistes',
                                start: 1980,
                                end: 1980},
            {title:'Plan des Artistes',
                start: 1980,
                end: 1980}]


    });
