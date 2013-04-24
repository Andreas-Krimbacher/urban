'use strict';

angular.module('udm.edit')
    .controller('GeoreferenceCtrl', function ($scope,$http,georeference) {

        $scope.items = [];
        $scope.currentImg = false;
        $scope.continousEditing = false;
        $scope.resultDisplayed = false;
        $scope.CP = [];
        $scope.CPProcess = false;
        $scope.addCPProcess = false;

        $scope.$on('$viewContentLoaded', function() {
            $('#select2').css({ width: '0px' });
        });

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
            if($scope.resultDisplayed) return;
            if($scope.CPProcess && !state){
                alert('CPProcess');
                return;
            }
            georeference.imgFix(state);
            $scope.imgFixed = state;
        };

        $scope.resizeImg = function(){
            $scope.currentImg.width = 1000;
            $scope.currentImg.height = 500;
            $scope.currentImg.scale = 1;

            georeference.centerImg();

            if(!$scope.$$phase) $scope.$digest();
        };

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
                    if(!$scope.$$phase) $scope.$digest();
                });
            }
        };

        $scope.$on('sliderChanged', function(e,value) {
            if($scope.items[$scope.selectedId]){
                if(value.name == 'opacity') value.value = value.value/100 +0.01;
                if(!$scope.resultDisplayed ){
                    $scope.currentImg[value.name] = value.value;
                    georeference.redrawImageOverlay();
                }
                else{
                    $scope.currentImg[value.name] = value.value;
                    georeference.setOpacityResult(value.value);
                }

            }
        });

        $scope.addCP = function(){
            if($scope.resultDisplayed) return;
            if(!$scope.CPProcess){
                setProcessState(true);
            }
            $scope.currentImg.opacity = 0.8;
            georeference.redrawImageOverlay();
            $scope.addCPProcess = true;
            georeference.createCP($scope.currentImg,function(point){
                if(!$scope.$$phase) $scope.$apply($scope.CP.push(point));
                if($scope.continousEditing) $scope.addCP();
                else{
                    if(!$scope.$$phase) $scope.$apply($scope.addCPProcess = false);
                }
            },function(){
                if(!$scope.$$phase) $scope.$digest();
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
            if($scope.resultDisplayed) return;
            georeference.cancelCP();
            $scope.addCPProcess = false;
            if($scope.CP.length == 0) setProcessState(false);
        };
        $scope.deleteCP = function(index){
            if($scope.resultDisplayed) return;
            georeference.removeCP( $scope.CP[index].id);
            $scope.CP.splice(index,1);
            if($scope.CP.length == 0) setProcessState(false);
        };
        $scope.deleteAllCP = function(){
            if($scope.resultDisplayed) return;
            for(var x = $scope.CP.length-1;x>=0; x--){
                $scope.deleteCP(x);
            }
        };
        $scope.toggleContinousEditing = function(){
            if($scope.resultDisplayed) return;
            $scope.continousEditing = !$scope.continousEditing;
            if(!$scope.addCPProcess) $scope.addCP();
        };

        $scope.send = function(){

            if($scope.CP.length < 3){
                alert('min 3 punkte');
                return;
            }

            $scope.continousEditing = false;
            georeference.cancelCP();
            $scope.addCPProcess = false;

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
                    $scope.showResult(data);
                }).
                error(function(data, status, headers, config) {
                    // called asynchronously if an error occurs
                    // or server returns response with an error status.
                });
        };

        var metaData = null;

        $scope.showResult = function(data){
            metaData = data;
            georeference.hideEditLayers();

            $scope.currentImg.opacity = 1;
            if(!$scope.$$phase) $scope.$digest()
            georeference.showResultLayer(metaData);

            $scope.resultDisplayed = true;
        };

        $scope.back = function(){
            georeference.destroyResultLayer();
            georeference.showEditLayers();
            georeference.redrawImageOverlay();

            $scope.$broadcast('disableSlider-opacity',false);
            $scope.resultDisplayed = false;

            var url = '/geo';
            $http.get(url,{params: {action:'deleteTmp',tileDB:metaData.tileDB}}).
                success(function(data, status, headers, config) {

                }).
                error(function(data, status, headers, config) {
                    // called asynchronously if an error occurs
                    // or server returns response with an error status.
                });
        };

        $scope.save = function(){
            var url = '/geo';
            $http.get(url,{params: {action:'save',tileDB:metaData.tileDB}}).
                success(function(data, status, headers, config) {
                    $scope.reset();
                }).
                error(function(data, status, headers, config) {
                    // called asynchronously if an error occurs
                    // or server returns response with an error status.
                });
        };


        $scope.reset = function(metaData){
            georeference.destroyResultLayer();
            georeference.destroyEditLayers();
            setProcessState(false);
            $scope.currentImg = false;
            $scope.continousEditing = false;
            $scope.resultDisplayed = false;
            $scope.CP = [];
            $scope.CPProcess = false;
            $scope.addCPProcess = false;
        };

    });
