'use strict';
/**
 * Parent Controller for the EditInfoEinheitCtrl,EditLernEinheitCtrl and GeoreferenceCtrl
 * @name Controller:EditCtrl
 * @namespace
 * @author Andreas Krimbacher
 */
angular.module('udm.edit')
    .controller('EditCtrl', function ($scope,OpenLayersMap) {
        //reset the map
        OpenLayersMap.resetMap();

        /**
         * Current editing view (infoEinheit,lernEinheit,georef)
         * @name Controller:EditCtrl#editView
         * @type {string}
         */
        $scope.editView = 'lernEinheit';

        /**
         * show the file upload dialog
         * @name  Controller:EditCtrl#showFileUpload
         * @function
         * @param type {string} type (imageUpload,georef)
         */
        $scope.showFileUpload = function(type) {
            $scope.$broadcast('showFileUpload',type);
        };

        /**
         * set the file upload target
         * @name  Controller:EditCtrl#setFileUploadTarget
         * @function
         * @param data {object} {name : (imageUpload,georef), target : target url without host)
         */
        $scope.setFileUploadTarget = function(data) {
            $scope.$broadcast('setFileUploadTarget',data);
        };

        /**
         * set the editing view
         * @name  Controller:EditCtrl#setMode
         * @function
         * @param mode {string} infoEinheit,lernEinheit,georef
         */
        $scope.setMode = function(mode){
            OpenLayersMap.resetMap();

            if(mode == 'georef') OpenLayersMap.setMaxZoomLevel(20);
            else OpenLayersMap.setMaxZoomLevel(18);

            $scope.editView = mode;
        };

        /**
         * helper to show a Info-Einheit in the map
         * @name  Controller:EditCtrl#showInfoEinheitInMap
         * @function
         * @param data {object} Info-Einheit
         */
        $scope.showInfoEinheitInMap = function(data){
            $scope.$broadcast('showInfoEinheit',data);
        };

    });
