'use strict';

angular.module('udm.edit')
    .controller('GeoreferenceCtrl', function ($scope,$http,mapGeoreference) {

        $scope.items = [];
        $scope.currentImg = false;
        $scope.continousEditing = false;
        $scope.resultDisplayed = false;
        $scope.CP = [];
        $scope.CPProcess = false;
        $scope.addCPProcess = false;

        mapGeoreference.clearAllLayers();

        $scope.$on('$viewContentLoaded', function() {
            $('#select2').css({ width: '0px' });
        });

        function getImgList(){
            $http.get('/fs',{params: {action:'georeferenceFileList'}}).
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
            if(value == 'georeferenceUpload') getImgList();
        });


        $scope.imgFix = function(state){
            if($scope.resultDisplayed) return;
            if($scope.CPProcess && !state){
                alert('CPProcess');
                return;
            }
            mapGeoreference.imgFix(state);
            $scope.imgFixed = state;
        };

        $scope.resizeImg = function(){
            $scope.currentImg.width = 1000;
            $scope.currentImg.height = 500;
            $scope.currentImg.scale = 1;

            mapGeoreference.centerImg();

            if(!$scope.$$phase) $scope.$digest();
        };

        $scope.change = function(){
            mapGeoreference.clearImgOverlay();
            mapGeoreference.clearCP();
            $scope.CP = [];
            if($scope.selectedId == -1){
                setProcessState(false);
                $scope.currentImg = false;
                $scope.setFileUploadTarget({name : 'georeferenceUpload', target : 'georeferenceUpload'});
                $scope.showFileUpload('georeferenceUpload');
            }
            else if($scope.selectedId >= 0 && $scope.selectedId != ''){
                if($scope.items[$scope.selectedId]){
                    setProcessState(false);
                }
                $scope.currentImg = $scope.items[$scope.selectedId];
                mapGeoreference.showImageOverlay($scope.currentImg,function(){
                    if(!$scope.$$phase) $scope.$digest();
                });
            }
        };

        $scope.$on('sliderChanged', function(e,value) {
            if($scope.items[$scope.selectedId]){
                if(value.name == 'opacity') value.value = value.value/100 +0.01;
                if(!$scope.resultDisplayed ){
                    $scope.currentImg[value.name] = value.value;
                    mapGeoreference.redrawImageOverlay();
                }
                else{
                    $scope.currentImg[value.name] = value.value;
                    mapGeoreference.setOpacityResult(value.value);
                }

            }
        });

        $scope.addCP = function(){
            if($scope.resultDisplayed) return;
            if(!$scope.CPProcess){
                setProcessState(true);
            }
            $scope.currentImg.opacity = 0.8;
            mapGeoreference.redrawImageOverlay();
            $scope.addCPProcess = true;
            mapGeoreference.createCP($scope.currentImg,function(point){
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
            mapGeoreference.cancelCP();
            $scope.addCPProcess = false;
            if($scope.CP.length == 0) setProcessState(false);
        };
        $scope.deleteCP = function(index){
            if($scope.resultDisplayed) return;
            mapGeoreference.removeCP( $scope.CP[index].id);
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
            mapGeoreference.cancelCP();
            $scope.addCPProcess = false;

            var gcp = '';
            for(var x in $scope.CP){
                gcp += $scope.CP[x].imgPoint.pixel + ',' + $scope.CP[x].imgPoint.line + ',' + $scope.CP[x].worldPoint.lon + ',' + $scope.CP[x].worldPoint.lat;
                if(x < $scope.CP.length-1) gcp += '|';
            }

            var params = {action:'georefImg',
                fileName:$scope.currentImg.text.substr(0, $scope.currentImg.text.lastIndexOf('.')) + '.tiff',
                gcp:gcp};


            $http.get('/geo',{params: params}).
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
            mapGeoreference.hideEditLayers();

            $scope.currentImg.opacity = 1;
            if(!$scope.$$phase) $scope.$digest()
            mapGeoreference.showResultLayer(metaData);

            $scope.resultDisplayed = true;
        };

        $scope.back = function(){
            mapGeoreference.destroyResultLayer();
            mapGeoreference.showEditLayers();
            mapGeoreference.redrawImageOverlay();

            $scope.$broadcast('disableSlider-opacity',false);
            $scope.resultDisplayed = false;

            $http.get('/geo',{params: {action:'deleteTmp',tileDB:metaData.tileDB}}).
                success(function(data, status, headers, config) {

                }).
                error(function(data, status, headers, config) {
                    // called asynchronously if an error occurs
                    // or server returns response with an error status.
                });
        };

        $scope.save = function(){
            $http.get('/geo',{params: {action:'save',tileDB:metaData.tileDB}}).
                success(function(data, status, headers, config) {
                    $scope.reset();
                }).
                error(function(data, status, headers, config) {
                    // called asynchronously if an error occurs
                    // or server returns response with an error status.
                });
        };


        $scope.reset = function(metaData){
            mapGeoreference.destroyResultLayer();
            mapGeoreference.destroyEditLayers();
            setProcessState(false);
            $scope.currentImg = false;
            $scope.continousEditing = false;
            $scope.resultDisplayed = false;
            $scope.CP = [];
            $scope.CPProcess = false;
            $scope.addCPProcess = false;
        };

    });
