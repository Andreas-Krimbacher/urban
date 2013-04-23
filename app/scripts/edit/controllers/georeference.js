'use strict';

angular.module('udm.edit')
    .controller('GeoreferenceCtrl', function ($scope,$http,georeference) {

        $scope.items = [];
        $scope.currentImg = false;
        $scope.continousEditing = false;

        var url = '/fs';
        function getImgList(){
            $http.get(url,{params: {action:'georeferenceFileList'}}).
                success(function(data, status, headers, config) {
                    $scope.items = [{id:-1,text:'Upload'}];
                    for(var x in data){
                        $scope.items.push({id:+x+1,text:data[x].name, path : data[x].path,width:1000,height:500, scale : 1,realWidth:data[x].width,realHeight:data[x].height, rot:0,opacity:1});
                    }
                    $scope.selectedId = '';
                    //$scope.selectedId =0;
                }).
                error(function(data, status, headers, config) {
                    // called asynchronously if an error occurs
                    // or server returns response with an error status.
                });
        }
        getImgList();

        $scope.$on('fileUploadFinished', function(e,value) {
            getImgList();
        });

        $scope.imgFix = function(state){
            if($scope.CPProcess && !state){
                alert('CPProcess');
                return;
            }
            georeference.imgFix(state);
            $scope.imgFixed = state;
        }

        $scope.change = function(){
            georeference.clearImgOverlay();
            georeference.clearCP();
            $scope.CP = [];
            if($scope.selectedId == -1){
                setProcessState(false);
                $scope.currentImg = false;
                $scope.showRasterImgUpload('showRasterImgUpload');
            }
            else if($scope.selectedId >= 0 && $scope.selectedId != ''){
                if($scope.items[$scope.selectedId]){
                    setProcessState(false);
                }
                $scope.currentImg = $scope.items[$scope.selectedId];
                georeference.showImageOverlay($scope.currentImg,function(){
                    $scope.$digest()
                });
            }
        };

        $scope.$on('sliderChanged', function(e,value) {
            if($scope.items[$scope.selectedId]){
                if(value.name == 'opacity') value.value = value.value/100 +0.01;
                $scope.currentImg[value.name] = value.value;
                georeference.redrawImageOverlay();
            }
        });

        $scope.CP = [];
        $scope.CPProcess = false;
        $scope.addCPProcess = false;

        $scope.addCP = function(){
            if(!$scope.CPProcess){
                setProcessState(true);
            }
            $scope.currentImg.opacity = 0.8;
            georeference.redrawImageOverlay();
            $scope.addCPProcess = true;
            georeference.createCP($scope.currentImg,function(point){
                $scope.$apply($scope.CP.push(point),$scope.addCPProcess = false);
                if($scope.continousEditing) $scope.addCP();
            },function(){
                $scope.$digest()
            });
        };

        function setProcessState(state){
            if(state){
                $scope.CPProcess = true;
                $scope.imgFix(true);
                $scope.$broadcast('disableSlider-width',true);
                $scope.$broadcast('disableSlider-height',true);
                $scope.$broadcast('disableSlider-rot',true);
            }
            else{
                $scope.CPProcess = false;
                $scope.$broadcast('disableSlider-width',false);
                $scope.$broadcast('disableSlider-height',false);
                $scope.$broadcast('disableSlider-rot',false);
            }
        }

        $scope.cancelCP = function(index){
            georeference.cancelCP();
            $scope.addCPProcess = false;
            if($scope.CP.length == 0) setProcessState(false);
        };
        $scope.deleteCP = function(index){
            georeference.removeCP( $scope.CP[index].id);
            $scope.CP.splice(index,1);
            if($scope.CP.length == 0) setProcessState(false);
        };
        $scope.deleteAllCP = function(){
            for(var x = $scope.CP.length-1;x>=0; x--){
                $scope.deleteCP(x);
            }
        };

        $scope.send = function(){

            if($scope.CP.length < 3){
                alert('min 3 punkte');
                return;
            }

            var gcp = '';
            for(var x in $scope.CP){
                gcp += $scope.CP[x].imgPoint.pixel + ',' + $scope.CP[x].imgPoint.line + ',' + $scope.CP[x].worldPoint.lon + ',' + $scope.CP[x].worldPoint.lat;
                if(x < $scope.CP.length-1) gcp += '|';
            }

            var params = {action:'georefImg',
                fileName:$scope.currentImg.text.substr(0, $scope.currentImg.text.lastIndexOf('.')) + '.tiff',
                gcp:gcp};

            var url = '/geo';
            $http.get(url,{params: params}).
                success(function(data, status, headers, config) {
                    $scope.showResult(data.name);
                }).
                error(function(data, status, headers, config) {
                    // called asynchronously if an error occurs
                    // or server returns response with an error status.
                });
        };

        $scope.showResult = function(name){
            var resultMode = true;
            georeference.hideLayers();
            georeference.showResultLayer(name);
        }

    });
