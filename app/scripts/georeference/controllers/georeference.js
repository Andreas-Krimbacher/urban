'use strict';

angular.module('udm.georeference')
    .controller('GeoreferenceCtrl', function ($scope,$http,georeference) {


            var url = '/fs'
            $scope.items = [];
            $scope.currentImg = false;


            $http.get(url,{params: {action:'imgFileList'}}).
                success(function(data, status, headers, config) {
                    for(var x in data){
                        $scope.items.push({id:x,text:data[x],width:1000,height:500,realWidth:804,realHeight:436, rot:0,opacity:1});
                    }
                    $scope.selectedId =0;
                }).
                error(function(data, status, headers, config) {
                    // called asynchronously if an error occurs
                    // or server returns response with an error status.
                });

            $scope.change = function(){
                if($scope.items[$scope.selectedId]){
                    georeference.clearCP();
                    $scope.CP = [];
                    setProcessState(false);

                    georeference.showImageOverlay(angular.copy($scope.items[$scope.selectedId]));
                    $scope.currentImg = $scope.items[$scope.selectedId];
                }
            };

            $scope.$on('sliderChanged', function(e,value) {
                if($scope.items[$scope.selectedId]){
                    if(value.name == 'opacity') value.value = value.value/100 +0.01;
                    $scope.items[$scope.selectedId][value.name] = value.value;
                    georeference.redrawImageOverlay(angular.copy($scope.currentImg));
                }
            });

            $scope.CP = [];
            $scope.CPProcess = false;

            $scope.addCP = function(){
                if(!$scope.CPProcess){
                    setProcessState(true);
                }
                georeference.createCP($scope.currentImg,function(point){
                    $scope.$apply($scope.CP.push(point));
                });
            };

            function setProcessState(state){
                if(state){
                    $scope.CPProcess = true;
                    georeference.fixImg();
                    $scope.$broadcast('disableSlider-width',true);
                    $scope.$broadcast('disableSlider-height',true);
                    $scope.$broadcast('disableSlider-rot',true);
                }
                else{
                    $scope.CPProcess = false;
                    georeference.freeImg();
                    $scope.$broadcast('disableSlider-width',false);
                    $scope.$broadcast('disableSlider-height',false);
                    $scope.$broadcast('disableSlider-rot',false);
                }
            }

            $scope.deleteCP = function(index){
                georeference.removeCP( $scope.CP[index].id);
                $scope.CP.splice(index,1);
                if($scope.CP.length == 0) setProcessState(false);
            };

            $scope.send = function(){
                OpenLayers.Request.POST({
                    url: "http://localhost:9000/geoserver/urban/wps",
                    data: new OpenLayers.Format.WPSExecute().write(process),
                    success: function(index){
                        alert('yes');
                    }

                });
            };

    });
