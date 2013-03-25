'use strict';

angular.module('swaApp')
  .factory('map', function ($rootScope) {
    // Service logic
    var map = null;

    // Public API here
    return {
      createMap: function (divId) {
          map = new OpenLayers.Map(divId);
          var osm = new OpenLayers.Layer.OSM('Simple OSM Map');
          map.addLayer(osm);
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
      }


    };
  });
