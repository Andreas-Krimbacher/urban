'use strict';

angular.module('udm.edit')
  .factory('feature', function (map) {

        var baseLayer = null;
        var overlayLayers = [];
        var featureLayer = null;
        var editLayer = null;
        var editOverlayPlanLayer = null;

        var overlayLayerZIndexCount = 0;

        var drawControl = null;
        var modifyControl = null;

        var featureAdded = function(feature){
           if(featureAddedCallback) featureAddedCallback(feature);
        };
        var featureAddedCallback = null;

        var map = map.getMap();

        var featureStyle = new OpenLayers.StyleMap({
            "default": new OpenLayers.Style({
                strokeColor:'${color}',
                strokeOpacity: .7,
                strokeWidth: 8,
                pointRadius: 6,
                fillColor:'${color}',
                fillOpacity: 0.4,
                graphicZIndex: '${zIndex}'
            }),
            "temporary": new OpenLayers.Style({
                strokeColor: "#E16E0F",
                strokeOpacity: .9,
                strokeWidth: 8,
                fillColor: "#E16E0F",
                fillOpacity: 0.4,
                pointRadius: 6,
                cursor: "pointer",
                graphicZIndex: '${zIndex}'
            }),
            "select": new OpenLayers.Style({
                strokeColor: "#E16E0F",
                strokeOpacity: .7,
                strokeWidth: 8,
                fillColor: "#E16E0F",
                fillOpacity: 0.4,
                pointRadius: 6,
                cursor: "pointer",
                graphicZIndex: '${zIndex}'
            })
        });

        var featureEditStyle = new OpenLayers.StyleMap({
            "default": new OpenLayers.Style({
                strokeColor:'${color}',
                strokeOpacity: 1,
                strokeWidth: 8,
                pointRadius: 6,
                fillColor:'${color}',
                fillOpacity: 0.7,
                graphicZIndex: '${zIndex}'
            }),
            "temporary": new OpenLayers.Style({
                strokeColor: "#E16E0F",
                strokeOpacity: 1,
                strokeWidth: 8,
                fillColor: "#E16E0F",
                fillOpacity: 0.7,
                pointRadius: 6,
                cursor: "pointer",
                graphicZIndex: '${zIndex}'
            }),
            "select": new OpenLayers.Style({
                strokeColor: "#E16E0F",
                strokeOpacity: 1,
                strokeWidth: 8,
                fillColor: "#E16E0F",
                fillOpacity: 0.7,
                pointRadius: 6,
                cursor: "pointer",
                graphicZIndex: '${zIndex}'
            })
        });


    // Public API here
    return {
        setBaseLayer : function(metaData){

            if(baseLayer){
                map.removeLayer(baseLayer);
            }

            var bounds = new OpenLayers.Bounds(metaData.BoundingBox.miny,
                    metaData.BoundingBox.minx,
                    metaData.BoundingBox.maxy,
                    metaData.BoundingBox.maxx).transform(new OpenLayers.Projection("EPSG:4326"),new OpenLayers.Projection("EPSG:900913"));

            baseLayer = new OpenLayers.Layer.TileStream( metaData.tileDB,
                    "http://localhost:8888/", {layername: metaData.tileDB,
                        minResolution:metaData.TileSet.minRes,
                        maxResolution:metaData.TileSet.maxRes,
                        maxExtent:bounds,
                        type:'png',
                        isBaseLayer:false,
                        serviceVersion:'v2',
                        transitionEffect:'resize',
                        buffer:3});

            baseLayer.setZIndex(100);

            map.addLayer(baseLayer);
        },
        removeBaseLayer : function(){
            if(baseLayer) map.removeLayer(baseLayer);
            baseLayer = null;
        },
        addOverlayLayer : function(metaData){

            var bounds = new OpenLayers.Bounds(metaData.BoundingBox.miny,
                metaData.BoundingBox.minx,
                metaData.BoundingBox.maxy,
                metaData.BoundingBox.maxx).transform(new OpenLayers.Projection("EPSG:4326"),new OpenLayers.Projection("EPSG:900913"));

            var overlayLayer = new OpenLayers.Layer.TileStream( metaData.tileDB,
                "http://localhost:8888/", {layername: metaData.tileDB,
                    minResolution:metaData.TileSet.minRes,
                    maxResolution:metaData.TileSet.maxRes,
                    maxExtent:bounds,
                    type:'png',
                    isBaseLayer:false,
                    serviceVersion:'v2',
                    transitionEffect:'resize',
                    buffer:3});

            overlayLayer.setZIndex(200 + overlayLayerZIndexCount);
            overlayLayerZIndexCount++;

            overlayLayers.push({layer: overlayLayer, name : metaData.tileDB});

            map.addLayer(overlayLayer);
        },
        removeOverlayLayer : function(metaData){
          for(var x in overlayLayers){
              if(overlayLayers[x].name == metaData.tileDB){
                  map.removeLayer(overlayLayers[x].layer);
                  overlayLayers.splice(x,1);
              }
          }

        },
        removeAllOverlayLayer : function(metaData){
            for(var x in overlayLayers){
                    map.removeLayer(overlayLayers[x].layer);
            }
            overlayLayers = [];

        },
        setEditOverlayPlanLayer : function(metaData){

            if(editOverlayPlanLayer){
                map.removeLayer(editOverlayPlanLayer);
            }

            var bounds = new OpenLayers.Bounds(metaData.BoundingBox.miny,
                metaData.BoundingBox.minx,
                metaData.BoundingBox.maxy,
                metaData.BoundingBox.maxx).transform(new OpenLayers.Projection("EPSG:4326"),new OpenLayers.Projection("EPSG:900913"));

            editOverlayPlanLayer = new OpenLayers.Layer.TileStream( metaData.tileDB,
                "http://localhost:8888/", {layername: metaData.tileDB,
                    minResolution:metaData.TileSet.minRes,
                    maxResolution:metaData.TileSet.maxRes,
                    maxExtent:bounds,
                    type:'png',
                    isBaseLayer:false,
                    serviceVersion:'v2',
                    transitionEffect:'resize',
                    buffer:3});

            editOverlayPlanLayer.setZIndex(250);

            map.addLayer(editOverlayPlanLayer);
        },
        removeEditOverlayPlanLayer : function(){
            if(editOverlayPlanLayer) map.removeLayer(editOverlayPlanLayer);
            editOverlayPlanLayer = null;
        },
        setFeatureLayer : function(){

            if(featureLayer){
                map.removeLayer(featureLayer);
            }

            featureLayer = new OpenLayers.Layer.Vector("Features",{
                styleMap: featureStyle,
                rendererOptions: { zIndexing: true }
            });

            featureLayer.setZIndex(300);

            map.addLayer(featureLayer);

        },
        addFeature : function(feature){

            if(featureLayer) featureLayer.addFeatures(feature);

        },
        removeFeature : function(feature){
            if(featureLayer) featureLayer.removeFeatures([feature]);

        },
        removeAllFeatures : function(feature){
            if(featureLayer) featureLayer.removeAllFeatures();

        },
        WKTToFeature : function(wkt){
            var WKTParser = new OpenLayers.Format.WKT();

            var feature = WKTParser.read(wkt.geom);
            feature.geometry.transform(new OpenLayers.Projection("EPSG:4326"),new OpenLayers.Projection("EPSG:900913"));

            feature.attributes = wkt.attr;

            return feature;
        },
        featureToWKT : function(feature,typ){
            var WKTParser = new OpenLayers.Format.WKT();

            feature = feature.clone();
            feature.geometry.transform(new OpenLayers.Projection("EPSG:900913"),new OpenLayers.Projection("EPSG:4326"));

            var wkt = {attr : feature.attributes, geom : WKTParser.write(feature), typ : typ};

            return wkt;
        },
        setEditLayer : function(){
            if(editLayer){
                map.removeLayer(editLayer);
            }

            editLayer = new OpenLayers.Layer.Vector("Edit",{
                styleMap: featureEditStyle,
                rendererOptions: { zIndexing: true }
            });

            editLayer.setZIndex(400);

            map.addLayer(editLayer);



            drawControl = {
                point: new OpenLayers.Control.DrawFeature(editLayer,
                    OpenLayers.Handler.Point,{featureAdded : featureAdded}),
                line: new OpenLayers.Control.DrawFeature(editLayer,
                    OpenLayers.Handler.Path,{featureAdded : featureAdded}),
                poly: new OpenLayers.Control.DrawFeature(editLayer,
                    OpenLayers.Handler.Polygon,{featureAdded : featureAdded})
            };

            map.addControl(drawControl.point);
            map.addControl(drawControl.line);
            map.addControl(drawControl.poly);

            modifyControl = new OpenLayers.Control.ModifyFeature(editLayer);

            map.addControl(modifyControl);

        },
        addEditFeature : function(feature){

            if(editLayer) editLayer.addFeatures(feature);

        },
        drawFeature : function(type,callback){

            featureAddedCallback = callback;

            switch (type) {
                case "point": drawControl.point.activate();
                    break;
                case "line": drawControl.line.activate();
                    break;
                case "poly": drawControl.poly.activate();
                    break;
                default:
                    return;
                    break;
            }
        },
        stopDrawFeature : function(type){
            switch (type) {
                case "point": drawControl.point.deactivate();
                    break;
                case "line": drawControl.line.deactivate();
                    break;
                case "poly": drawControl.poly.deactivate();
                    break;
                default:
                    return;
                    break;
            }
        },
        modifyFeature : function(){
            modifyControl.activate();
        },
        stopModifyFeature : function(){
            modifyControl.deactivate();
        },
        removeEditFeature : function(){
            if(editLayer) editLayer.removeAllFeatures();
        },
        redrawEditLayer : function(){
            if(editLayer) editLayer.redraw();
        }





    };
  });