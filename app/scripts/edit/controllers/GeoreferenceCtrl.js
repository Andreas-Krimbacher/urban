'use strict';
/**
 * Controller for the georeference edit view, the controller use the service mapGeoreference
 * @name Controller:GeoreferenceCtrl
 * @namespace
 * @author Andreas Krimbacher
 */
angular.module('udm.edit')
    .controller('GeoreferenceCtrl', function ($scope,$http,mapGeoreference) {

        /**
         * image objects for georeferencing, e.g {id:1,text:'img1', path : 'img1.png',width:1000,height:500, scale : 1,realWidth:1400,realHeight:1400, rot:0,opacity:1}
         * @name Controller:GeoreferenceCtrl#items
         * @type {Array(object)}
         */
        $scope.items = [];
        /**
         * current image object
         * @name Controller:GeoreferenceCtrl#currentImg
         * @type {object}
         */
        $scope.currentImg = false;
        /**
         * continous editing flag
         * @name Controller:GeoreferenceCtrl#continousEditing
         * @type {boolean}
         */
        $scope.continousEditing = false;
        /**
         * result displayed flag
         * @name Controller:GeoreferenceCtrl#resultDisplayed
         * @type {boolean}
         */
        $scope.resultDisplayed = false;
        /**
         * referenz points
         * @name Controller:GeoreferenceCtrl#CP
         * @type {Array(object)}
         */
        $scope.CP = [];
        /**
         * edit reference points flag
         * @name Controller:GeoreferenceCtrl#CPProcess
         * @type {boolean}
         */
        $scope.CPProcess = false;
        /**
         * add reference point flag
         * @name Controller:GeoreferenceCtrl#addCPProcess
         * @type {boolean}
         */
        $scope.addCPProcess = false;

        //reset mapGeoreference service
        mapGeoreference.clearAllLayers();

        //fix select2
        $scope.$on('$viewContentLoaded', function() {
            $('#select2').css({ width: '0px' });
        });

        /**
         * get the image list for georeferencing from the server
         * @name  Controller:GeoreferenceCtrl#getImgList
         * @function
         */
        function getImgList(){
            $http.get('/fs',{params: {action:'georeferenceFileList'}}).
                success(function(data) {
                    $scope.items = [{id:-1,text:'Upload'}];
                    var x;
                    for(x=0; x < data.length; x++){
                        $scope.items.push({id:+x+1,text:data[x].name, path : data[x].path,width:1000,height:500, scale : 1,realWidth:data[x].width,realHeight:data[x].height, rot:0,opacity:1});
                    }
                    $scope.selectedId = '';
                    //$scope.selectedId =0;
                }).
                error(function(data, status, headers, config) {
                    // called asynchronously if an error occurs
                    // or server returns response with an error status.
                });
        };
        getImgList();

        //refresh image list on file upload finsihed
        $scope.$on('fileUploadFinished', function(e,value) {
            if(value == 'georeferenceUpload') getImgList();
        });


        /**
         * fix the image to the base layer
         * @name  Controller:GeoreferenceCtrl#imgFix
         * @function
         */
        $scope.imgFix = function(state){
            if($scope.resultDisplayed) return;
            if($scope.CPProcess && !state){
                alert('CPProcess');
                return;
            }
            mapGeoreference.imgFix(state);
            $scope.imgFixed = state;
        };

        /**
         * resize image to the initial values
         * @name  Controller:GeoreferenceCtrl#resizeImg
         * @function
         */
        $scope.resizeImg = function(){
            $scope.currentImg.width = 1000;
            $scope.currentImg.height = 500;
            $scope.currentImg.scale = 1;

            mapGeoreference.centerImg();

            if(!$scope.$$phase) $scope.$digest();
        };

        /**
         * apply image change
         * @name  Controller:GeoreferenceCtrl#change
         * @function
         */
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

        /**
         * apply slider change
         * @name  Controller:GeoreferenceCtrl#sliderChanged
         * @event
         * @param value {object} {name: value name, value: value}
         */
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

        /**
         * start the process to add a reference point
         * @name  Controller:GeoreferenceCtrl#addCP
         * @function
         */
        $scope.addCP = function(){
            if($scope.resultDisplayed || $scope.addCPProcess) return;
            if(!$scope.CPProcess){
                setProcessState(true);
            }
            $scope.currentImg.opacity = 0.8;
            mapGeoreference.redrawImageOverlay();
            $scope.addCPProcess = true;
            mapGeoreference.createCP($scope.currentImg,function(point){
                if(!point){
                    $scope.addCPProcess = false;
                    if($scope.continousEditing){
                        $scope.addCP();
                    }
                    return;
                }
                if(!$scope.$$phase) $scope.$apply($scope.CP.push(point));
                else $scope.CP.push(point);
                if($scope.continousEditing){
                    $scope.addCPProcess = false;
                    $scope.addCP();
                }
                else{
                    if(!$scope.$$phase) $scope.$apply($scope.addCPProcess = false);
                    else $scope.addCPProcess = false;
                }
            },function(){
                if(!$scope.$$phase) $scope.$digest();
            });
        };

        /**
         * set the the edit reference points process state
         * @name  Controller:GeoreferenceCtrl#setProcessState
         * @function
         * @param state {boolean} state
         */
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

        /**
         * highlight reference point in map
         * @name  Controller:GeoreferenceCtrl#mouseEnter
         * @function
         * @param id {integer} reference point id
         */
        $scope.mouseEnter = function(id){
            mapGeoreference.highlightCP(id);
        };

        /**
         * unhighlight reference point in map
         * @name  Controller:GeoreferenceCtrl#mouseLeave
         * @function
         * @param id {integer} reference point id
         */
        $scope.mouseLeave = function(id){
            mapGeoreference.unhighlightCP(id);
        };

        /**
         * cancel refernce point adding process
         * @name  Controller:GeoreferenceCtrl#cancelCP
         * @function
         */
        $scope.cancelCP = function(){
            if($scope.resultDisplayed) return;
            mapGeoreference.cancelCP();
            $scope.addCPProcess = false;
            if($scope.CP.length == 0) setProcessState(false);
        };

        /**
         * delete refernce point
         * @name  Controller:GeoreferenceCtrl#deleteCP
         * @function
         * @param index {integer} index in CP
         */
        $scope.deleteCP = function(index){
            if($scope.resultDisplayed) return;
            mapGeoreference.removeCP( $scope.CP[index].id);
            $scope.CP.splice(index,1);
            if($scope.CP.length == 0) setProcessState(false);
        };

        /**
         * delete all refernce point
         * @name  Controller:GeoreferenceCtrl#deleteAllCP
         * @function
         */
        $scope.deleteAllCP = function(){
            if($scope.resultDisplayed) return;
            for(var x = $scope.CP.length-1;x>=0; x--){
                $scope.deleteCP(x);
            }
        };

        /**
         * toogle continouse editing mode
         * @name  Controller:GeoreferenceCtrl#toggleContinousEditing
         * @function
         */
        $scope.toggleContinousEditing = function(){
            if($scope.resultDisplayed) return;
            $scope.continousEditing = !$scope.continousEditing;
            if(!$scope.addCPProcess) $scope.addCP();
        };

        /**
         * send reference points to server and georeference image
         * @name  Controller:GeoreferenceCtrl#send
         * @function
         */
        $scope.send = function(){

            if($scope.CP.length < 3){
                alert('min 3 punkte');
                return;
            }

            $scope.continousEditing = false;
            mapGeoreference.cancelCP();
            $scope.addCPProcess = false;

            var gcp = '';
            var x;
            for(x = 0; x < $scope.CP.length; x++){
                gcp += $scope.CP[x].imgPoint.pixel + ',' + $scope.CP[x].imgPoint.line + ',' + $scope.CP[x].worldPoint.lon + ',' + $scope.CP[x].worldPoint.lat;
                if(x < $scope.CP.length-1) gcp += '|';
            }

            var params = {action:'georefImg',
                fileName:$scope.currentImg.text.substr(0, $scope.currentImg.text.lastIndexOf('.')) + '.tiff',
                gcp:gcp};


            $http.get('/geo',{params: params}).
                success(function(data) {
                    $scope.showResult(data);
                }).
                error(function(data, status, headers, config) {
                    // called asynchronously if an error occurs
                    // or server returns response with an error status.
                });
        };

        var metaData = null;

        /**
         * show georeferenced image in map
         * @name  Controller:GeoreferenceCtrl#showResult
         * @function
         * @param data {object} server respond
         */
        $scope.showResult = function(data){
            metaData = data;
            mapGeoreference.hideEditLayers();

            $scope.currentImg.opacity = 1;
            if(!$scope.$$phase) $scope.$digest();
            mapGeoreference.showResultLayer(metaData);

            $scope.resultDisplayed = true;
        };

        /**
         * switch from result view back to editing view
         * @name  Controller:GeoreferenceCtrl#back
         * @function
         */
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

        /**
         * save the result
         * @name  Controller:GeoreferenceCtrl#save
         * @function
         */
        $scope.save = function(){
            $http.get('/geo',{params: {action:'save',tileDB:metaData.tileDB}}).
                success(function() {
                    $scope.reset();
                }).
                error(function(data, status, headers, config) {
                    // called asynchronously if an error occurs
                    // or server returns response with an error status.
                });
        };

        /**
         * reset the georefernce view
         * @name  Controller:GeoreferenceCtrl#reset
         * @function
         */
        $scope.reset = function(){
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
