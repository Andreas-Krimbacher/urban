'use strict';

angular.module('udm.map')
    .factory('OpenLayersMap', function () {
        // Service logic
        var map = null;
        var offline = false;

        var _basemaps = {};
        var _currentBasemap = null;

        function _setBasemap(id){
            if(_currentBasemap){
                map.removeLayer(_currentBasemap.map);
                _currentBasemap.active = false;
            }
            map.addLayer(_basemaps[id].map);
            _basemaps[id].active = true;
            _currentBasemap = _basemaps[id];
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
                    numZoomLevels: 18
                };
                map = new OpenLayers.Map(divId,options);



                _basemaps = {};
                _currentBasemap = null;

                var osm = new OpenLayers.Layer.OSM('Simple OSM Map');
                _basemaps.osm = {name:'OpenStreet Map',map:osm,active:false};

                if(!offline){
                    var gphy = new OpenLayers.Layer.Google(
                        "Google Physical",
                        {type: google.maps.MapTypeId.TERRAIN}
                    );
                    _basemaps.gphy = {name:'Google Gelände',map:gphy,active:false};

                    var gmap = new OpenLayers.Layer.Google("Google Streets"
                    );
                    _basemaps.gmap = {name:'Google Streets',map:gmap,active:false};

                    var ghyb = new OpenLayers.Layer.Google(
                        "Google Hybrid",
                        {type: google.maps.MapTypeId.HYBRID}
                    );
                    _basemaps.ghyb = {name:'Google Hybrid',map:ghyb,active:false};

                    var gsat = new OpenLayers.Layer.Google(
                        "Google Satellite",
                        {type: google.maps.MapTypeId.SATELLITE}
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

                $('.mapLabel').remove();

                var featureLayer = new OpenLayers.Layer.Vector("Dummy",{
                    rendererOptions: { zIndexing: true }
                });
                featureLayer.setZIndex(1);

                map.addLayer(featureLayer);
            },
            setNumZoomLevel : function(zoomLevel){
                if(map.getZoom() > zoomLevel)
                    map.zoomTo(zoomLevel);
                map.numZoomLevels = zoomLevel+1;
                _currentBasemap.map.numZoomLevels = zoomLevel+1;
            }
        }
    });
