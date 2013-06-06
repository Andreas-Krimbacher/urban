'use strict';
/**
 * Service for the openlayers maps
 * @name Service:OpenLayersMap
 * @namespace
 * @author Andreas Krimbacher
 */
angular.module('udm.map')
    .factory('OpenLayersMap', function () {
        // Service logic

        /**
         * openlayers map object
         * @name Service:OpenLayersMap#map
         * @private
         * @type {object}
         */
        var map = null;

        /**
         * offline mode, no google maps are loaded
         * @name Service:OpenLayersMap#offline
         * @private
         * @type {boolean}
         */
        var offline = false;

        /**
         * object with all basemaps, e.g. gmap: {name:'Google Gelände',map:gphy,active:false};
         * @name Service:OpenLayersMap#_basemaps
         * @private
         * @type {object}
         */
        var _basemaps = {};

        /**
         * object of the current active basemap
         * @name Service:OpenLayersMap#_currentBasemap
         * @private
         * @type {object}
         */
        var _currentBasemap = null;

        /**
         * current maximum zoom level
         * @name Service:OpenLayersMap#_currentMaxZoomLevel
         * @private
         * @type {integer}
         */
        var _currentMaxZoomLevel = 19;

        /**
         * set a basemap from the _basemaps object
         * @name  Service:OpenLayersMap#_setBasemap
         * @function
         * @private
         * @param id {string} basemap id (osm,gmap,gphy,gsat,ghyb)
         */
        function _setBasemap(id){
            if(_currentBasemap){
                map.removeLayer(_currentBasemap.map);
                _currentBasemap.active = false;
            }
            map.addLayer(_basemaps[id].map);
            _basemaps[id].active = true;
            _currentBasemap = _basemaps[id];
        }

        /**
         * set the maximum zoom level
         * @name  Service:OpenLayersMap#_setMaxZoomLevel
         * @function
         * @private
         * @param zoomLevel {integer} zoom level
         */
        function _setMaxZoomLevel(zoomLevel){
            if( _currentBasemap.map.maxZoomLevelGeoref < (zoomLevel)){
                zoomLevel = _currentBasemap.map.maxZoomLevelGeoref;
            }

            if(map.getZoom() > zoomLevel)
                map.zoomTo(zoomLevel);

            map.numZoomLevels = zoomLevel+1;
            _currentBasemap.map.numZoomLevels = zoomLevel+1;
        }

        // Public API here
        return {
            /**
             * get the openlayers map object
             * @name  Service:OpenLayersMap#getMap
             * @function
             * @returns {object} openlayers map object
             */
            getMap : function(){
                return map;
            },
            /**
             * create the openlayers map with basemaps
             * @name  Service:OpenLayersMap#createMap
             * @function
             * @param divId {string} id of the dom elment
             */
            createMap : function (divId) {
                var options = {
                    projection: "EPSG:900913",
                    units: 'm',
                    numZoomLevels: 19
                };
                map = new OpenLayers.Map(divId,options);


                map.events.register('zoomend', this, function () {
                    var x = map.getZoom();

                    if( x < 12)
                    {

                        map.setCenter(new OpenLayers.LonLat(2.3408,48.8567).transform(
                            new OpenLayers.Projection("EPSG:4326"),
                            map.getProjectionObject()
                        ),12);
                    }
                });

                _basemaps = {};
                _currentBasemap = null;

                var osm = new OpenLayers.Layer.OSM('Simple OSM Map');
                _basemaps.osm = {name:'OpenStreet Map',map:osm,active:false};

                if(!offline){
                    var gphy = new OpenLayers.Layer.Google(
                        "Google Physical",
                        {type: google.maps.MapTypeId.TERRAIN,maxZoomLevelGeoref: 15}
                    );
                    _basemaps.gphy = {name:'Google Gelände',map:gphy,active:false};

                    var gmap = new OpenLayers.Layer.Google("Google Streets",{maxZoomLevelGeoref: 18}
                    );
                    _basemaps.gmap = {name:'Google Streets',map:gmap,active:false};

                    var ghyb = new OpenLayers.Layer.Google(
                        "Google Hybrid",
                        {type: google.maps.MapTypeId.HYBRID,maxZoomLevelGeoref: 18}
                    );
                    _basemaps.ghyb = {name:'Google Hybrid',map:ghyb,active:false};

                    var gsat = new OpenLayers.Layer.Google(
                        "Google Satellite",
                        {type: google.maps.MapTypeId.SATELLITE,maxZoomLevelGeoref: 18}
                    );
                    _basemaps.gsat = {name:'Google Luftbild',map:gsat,active:false};

                    _setBasemap('gsat');
                }
                else{
                    _setBasemap('osm');
                }

            },
            /**
             * set the map center and zoom
             * @name  Service:OpenLayersMap#setCenter
             * @function
             * @param Lon {float} longitude, WGS84
             * @param Lat {float} latitude, WGS84
             * @param Zoom {integer} zoom level
             */
            setCenter: function(Lon,Lat,Zoom){
                map.setCenter(
                    new OpenLayers.LonLat(Lon,Lat).transform(
                        new OpenLayers.Projection("EPSG:4326"),
                        map.getProjectionObject()
                    ), Zoom
                );
            },
            /**
             * add layers to the map
             * @name  Service:OpenLayersMap#addLayers
             * @function
             * @param layers {Array(object)} array of openlayers layers
             */
            addLayers: function(layers){
                map.addLayers(layers);
            },
            /**
             * add controls to the map
             * @name  Service:OpenLayersMap#addControls
             * @function
             * @param controls {Array(object)} array of openlayers controls
             */
            addControls: function(controls){
                map.addControls(controls)
            },
            /**
             * get the basemaps object
             * @name  Service:OpenLayersMap#getBasemaps
             * @function
             * @returns {object} _basemaps object
             */
            getBasemaps: function(){
                return _basemaps;
            },
            /**
             * set a basemap from the _basemaps object
             * @name  Service:OpenLayersMap#setBasemap
             * @function
             * @param id {string} basemap id (osm,gmap,gphy,gsat,ghyb)
             */
            setBasemap: function(id){
                _setBasemap(id);
                _setMaxZoomLevel(_currentMaxZoomLevel);
            },
            /**
             * reset the map, delete all layers, controls and events
             * @name  Service:OpenLayersMap#resetMap
             * @function
             */
            resetMap: function(){
                if(!map) return;
                var i;
                for (i = map.layers.length-1; i >= 0; i--){
                    if(!map.layers[i].isBaseLayer) map.removeLayer(map.layers[i]);
                }
                for (i = map.controls.length-1; i >= 0; i--){

                    if(map.controls[i].displayClass != 'olControlNavigation' && map.controls[i].displayClass != 'olControlZoom'){
                        map.controls[i].deactivate();
                        map.removeControl(map.controls[i]);
                    }
                }

                map.events.remove('zoomend');
                map.events.remove('movestart');
                map.events.remove('move');

                map.events.register('zoomend', this, function () {
                    var x = map.getZoom();

                    if( x < 12)
                    {

                        map.setCenter(new OpenLayers.LonLat(2.3408,48.8567).transform(
                            new OpenLayers.Projection("EPSG:4326"),
                            map.getProjectionObject()
                        ),12);
                    }
                });

                $('.mapLabel').remove();

                var featureLayer = new OpenLayers.Layer.Vector("Dummy",{
                    rendererOptions: { zIndexing: true }
                });
                featureLayer.setZIndex(1);

                map.addLayer(featureLayer);
            },
            /**
             * set the max zoom level
             * @name  Service:OpenLayersMap#setMaxZoomLevel
             * @function
             * @param zoomLevel {integer} zoom level
             */
            setMaxZoomLevel : function(zoomLevel){
                _setMaxZoomLevel(zoomLevel);
                _currentMaxZoomLevel = zoomLevel;
            }
        }
    });
