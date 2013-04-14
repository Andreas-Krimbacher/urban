'use strict';

angular.module('swaApp')
  .factory('map', function ($rootScope) {
    // Service logic
    var map = null;
    var imgLayer = null;

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
              units: 'm'
          };
          map = new OpenLayers.Map(divId,options);

//
//          var mousePositionCtrl = new OpenLayers.Control.MousePosition({
//                  suffix: '<a target="_blank" ' +
//                      'href="http://spatialreference.org/ref/epsg/4326/">' +
//                      'EPSG:4326asssssssssssss</a> coordinates: '
//              }
//          );
//
//          map.addControl(mousePositionCtrl);

          var osm = new OpenLayers.Layer.OSM('Simple OSM Map');
          _basemaps.osm = {name:'OpenStreet Map',map:osm,active:false};

          var gphy = new OpenLayers.Layer.Google(
              "Google Physical",
              {type: google.maps.MapTypeId.TERRAIN}
          );
          _basemaps.gphy = {name:'Google Gelände',map:gphy,active:false};

          var gmap = new OpenLayers.Layer.Google(
              "Google Streets",
              {numZoomLevels: 20}
          );
          _basemaps.gmap = {name:'Google Streets',map:gmap,active:false};

          var ghyb = new OpenLayers.Layer.Google(
              "Google Hybrid",
              {type: google.maps.MapTypeId.HYBRID, numZoomLevels: 20}
          );
          _basemaps.ghyb = {name:'Google Hybrid',map:ghyb,active:false};

          var gsat = new OpenLayers.Layer.Google(
              "Google Satellite",
              {type: google.maps.MapTypeId.SATELLITE, numZoomLevels: 22}
          );
          _basemaps.gsat = {name:'Google Luftbild',map:gsat,active:false};

          _setBasemap('gsat');
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
      getDrawControl: function(type,layer){
          if(type == 'Point'){
              var control = new OpenLayers.Control.DrawFeature(
                  layer, OpenLayers.Handler.Point
              );
          }
          if(type == 'Line'){
              var control = new OpenLayers.Control.DrawFeature(
                  layer, OpenLayers.Handler.Path
              );
          }
          if(type == 'Poly'){
              var control = new OpenLayers.Control.DrawFeature(
                  layer, OpenLayers.Handler.Polygon
              );
          }

          map.addControl(control);

          return control;
      },
      getEditControl: function(layers){

          var editControls = [];
          for(var x in layers){
              layers[x].editControl = new OpenLayers.Control.ModifyFeature(layers[x]);

              editControls.push(layers[x].editControl);
              map.addControl(layers[x].editControl);
          }

          var selectControl = new OpenLayers.Control.SelectFeature(layers);

          var lastFeature = null;

          selectControl.events.register('featurehighlighted',this,function(e){
              for(var x in editControls){
                  editControls[x].deactivate();
              }

              if(lastFeature)  lastFeature.layer.editControl.unselectFeature(lastFeature);
              e.feature.layer.editControl.selectFeature(e.feature);

              lastFeature = e.feature;
          });

          selectControl.events.register('featureunhighlighted',this,function(e){
              if(lastFeature) lastFeature.layer.editControl.unselectFeature(lastFeature);
              lastFeature = null;
          });

          map.addControl(selectControl);

          var active = false;

          return {
              activate : function(){
                      for(var x in layers){
                          layers[x].events.register('featureselected',this,function(e){
                              if(active) $rootScope.$broadcast('showAttributes', e.feature);
                          });
                          layers[x].events.register('featureunselected',this,function(e){
                              if(active) $rootScope.$broadcast('hideAttributes');
                          });
                      }
                    selectControl.activate();
                  active = true;
              },
              deactivate : function(){
                  if(lastFeature) lastFeature.layer.editControl.unselectFeature(lastFeature);
                  selectControl.unselectAll();
                    //ToDo: unregister
//                  for(var x in layers){
//                      layers[x].events.unregister('featureselected',this);
//                      layers[x].events.unregister('featureunselected',this);
//                  }

                  selectControl.deactivate();
                  active = false;
              }
          }

      },
      getDeleteControl: function(layers){
            var selectControl = new OpenLayers.Control.SelectFeature(layers);

            var lastFeature = null;

            selectControl.events.register('featurehighlighted',this,function(e){
                if(e.feature.fid == undefined) {
                    e.feature.layer.destroyFeatures([e.feature]);
                } else {
                    e.feature.state = OpenLayers.State.DELETE;
                    e.feature.layer.events.triggerEvent("afterfeaturemodified",
                        {feature:e.feature});
                    e.feature.renderIntent = "select";
                    e.feature.layer.drawFeature(e.feature);
                }
            });

            map.addControl(selectControl);


            return selectControl
      },
      showImageOverlay: function(img){

            var styleMap = new OpenLayers.Style({
                externalGraphic: "${text}",
                graphicWidth: "${width}",
                graphicHeight: "${height}",
                rotation:"${rot}"
            });
            imgLayer = new OpenLayers.Layer.Vector("My Image Overlay", {
                styleMap: styleMap
            });


            var newPoint = new OpenLayers.Geometry.Point(map.getCenter().lon,map.getCenter().lat);
            var pointFeature = new OpenLayers.Feature.Vector(newPoint);
            pointFeature.attributes = img;

            imgLayer.addFeatures([pointFeature]);
            map.addLayers([imgLayer]);

        },
        redrawImageOverlay: function(img){

            imgLayer.redraw();

        }


    };
  });
