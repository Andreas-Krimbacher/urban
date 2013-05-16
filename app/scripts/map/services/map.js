'use strict';

angular.module('udm.map')
    .factory('OpenLayersMap', function ($rootScope) {
        // Service logic
        var map = null;
        var offline = false;

        var _basemaps = {};
        var _currentBasempas = null;

        function _setBasemap(id){
            if(_currentBasempas){
                map.removeLayer(_currentBasempas.map);
                _currentBasempas.active = false;
            }
            map.addLayer(_basemaps[id].map);
            _basemaps[id].active = true;
            _currentBasempas = _basemaps[id];
        }

        // Public API here
        return {
            getMap : function(){
                return map;
            },
            createMap : function (divId) {
                var options = {
                    projection: "EPSG:900913",
                    units: 'm',
                };
                map = new OpenLayers.Map(divId,options);

                _basemaps = {};
                _currentBasempas = null;

                var osm = new OpenLayers.Layer.OSM('Simple OSM Map');
                _basemaps.osm = {name:'OpenStreet Map',map:osm,active:false};

                if(!offline){
                    var gphy = new OpenLayers.Layer.Google(
                        "Google Physical",
                        {type: google.maps.MapTypeId.TERRAIN},
                        {numZoomLevels: 19}
                    );
                    _basemaps.gphy = {name:'Google Gelände',map:gphy,active:false};

                    var gmap = new OpenLayers.Layer.Google(
                        "Google Streets",
                        {numZoomLevels: 19}
                    );
                    _basemaps.gmap = {name:'Google Streets',map:gmap,active:false};

                    var ghyb = new OpenLayers.Layer.Google(
                        "Google Hybrid",
                        {type: google.maps.MapTypeId.HYBRID, numZoomLevels: 19}
                    );
                    _basemaps.ghyb = {name:'Google Hybrid',map:ghyb,active:false};

                    var gsat = new OpenLayers.Layer.Google(
                        "Google Satellite",
                        {type: google.maps.MapTypeId.SATELLITE, numZoomLevels: 19}
                    );
                    _basemaps.gsat = {name:'Google Luftbild',map:gsat,active:false};

                    _setBasemap('gsat');
                }
                else{
                    _setBasemap('osm');
                }

            },
            setCenter: function(Lon,Lat,Zoom){
                map.setCenter(
                    new OpenLayers.LonLat(Lon,Lat).transform(
                        new OpenLayers.Projection("EPSG:4326"),
                        map.getProjectionObject()
                    ), Zoom
                );
            },
            addLayers: function(layers){
                map.addLayers(layers);
            },
            addControls: function(controls){
                map.addControls(controls)
            },
            getBasemaps: function(){
                return _basemaps;
            },
            setBasemap: function(id){
                _setBasemap(id);
            },
            resetMap: function(){
                if(!map) return;
                for (var i = map.layers.length-1; i >= 0; i--){
                    if(!map.layers[i].isBaseLayer) map.removeLayer(map.layers[i]);
                }
            }
        }
    });
