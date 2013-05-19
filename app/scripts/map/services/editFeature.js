'use strict';

angular.module('udm.map')
  .factory('mapEditFeature', function (OpenLayersMap) {

        var baseLayer = null;
        var overlayLayers = [];
        var featureLayer = null;
        var editFeatureLayer = null;
        var editOverlayLayer = null;

        var overlayLayerZIndexCount = 0;

        var drawControl = null;
        var modifyControl = null;

        var featureAdded = function(feature){
           if(featureAddedCallback) featureAddedCallback(feature);
        };
        var featureAddedCallback = null;

        var OLmap = OpenLayersMap.getMap();


        var featureStyle = new OpenLayers.StyleMap({
            "default": new OpenLayers.Style()
        });

        var lookupDefault = {
            "point": {
                strokeColor:'${color}',
                strokeOpacity: .7,
                strokeWidth: 4,
                pointRadius: 7,
                fillColor:'${color}',
                fillOpacity: 0.4,
                graphicZIndex: '${zIndex}'
            },
            "poly": {
                strokeColor:'${color}',
                strokeOpacity: .7,
                strokeWidth: 6,
                pointRadius: 6,
                fillColor:'${color}',
                fillOpacity: 0.4,
                graphicZIndex: '${zIndex}'
            },
            "line" : {
                strokeColor:'${color}',
                strokeOpacity: .7,
                strokeWidth: 6,
                pointRadius: 6,
                fillColor:'${color}',
                fillOpacity: 0.4,
                graphicZIndex: '${zIndex}'
            },
            "pointOri" : {
                fillOpacity: 0.7,
                'pointRadius':25,
                rotation:"${rot}",
                externalGraphic: '/styles/images/viewpoint.png'
            }
        };

        featureStyle.addUniqueValueRules("default", "typ", lookupDefault);


        var featureEditStyle = new OpenLayers.StyleMap({
            "default": new OpenLayers.Style({
                strokeColor: '${color}',
                strokeOpacity: 1,
                strokeWidth: 6,
                fillColor: '${color}',
                fillOpacity: 0.8,
                pointRadius: 7,
                graphicZIndex: '${zIndex}'
            }),
            "temporary": new OpenLayers.Style({
                strokeColor: '${color}',
                strokeOpacity: 1,
                strokeWidth: 6,
                fillColor: '${color}',
                fillOpacity: 0.8,
                pointRadius: 7,
                graphicZIndex: '${zIndex}'
            }),
            "select": new OpenLayers.Style({
                strokeColor: '${color}',
                strokeOpacity: 1,
                strokeWidth: 6,
                fillColor: '${color}',
                fillOpacity: 0.8,
                pointRadius: 7,
                graphicZIndex: '${zIndex}'
            }),
            "vertex" : new OpenLayers.Style({
                fillColor: '#5bb75b',
                strokeColor: '#5bb75b',
                strokeWidth: 3,
                fillOpacity: 0.8,
                pointRadius: 4
            })
        });

        var featureEditStyleOri = new OpenLayers.StyleMap({
            "default": new OpenLayers.Style({
                fillOpacity: 1,
                'pointRadius':25,
                rotation:"${rot}",
                externalGraphic: '/styles/images/viewpoint.png'
            })
        });

        var featureCreateStyle = new OpenLayers.StyleMap({
            "default": new OpenLayers.Style({
                strokeOpacity: 1,
                strokeWidth: 4,
                fillOpacity: 0.8,
                pointRadius: 7
            })
        });

        var featureCreateStyleOri = new OpenLayers.StyleMap({
            "default": new OpenLayers.Style({
                fillOpacity: 1,
                'pointRadius':25,
                externalGraphic: '/styles/images/viewpoint.png'
            })
        });


    // Public API here
    return {
        clearAllLayer : function(){
            baseLayer = null;
            overlayLayers = [];
            featureLayer = null;
            editFeatureLayer = null;
            editOverlayLayer = null;
        },
        setBaseLayer : function(metaData){

            if(baseLayer){
                OLmap.removeLayer(baseLayer);
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

            OLmap.addLayer(baseLayer);
        },
        removeBaseLayer : function(){
            if(baseLayer) OLmap.removeLayer(baseLayer);
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

            OLmap.addLayer(overlayLayer);
        },
        removeOverlayLayer : function(metaData){
          for(var x = 0; x < overlayLayers.length; x++){
              if(overlayLayers[x].name == metaData.tileDB){
                  OLmap.removeLayer(overlayLayers[x].layer);
                  overlayLayers.splice(x,1);
              }
          }

        },
        removeAllOverlayLayer : function(){
            for(var x = 0; x < overlayLayers.length; x++){
                    OLmap.removeLayer(overlayLayers[x].layer);
            }
            overlayLayers = [];

        },
        setEditOverlayLayer : function(metaData){

            if(editOverlayLayer){
                OLmap.removeLayer(editOverlayLayer);
            }

            var bounds = new OpenLayers.Bounds(metaData.BoundingBox.miny,
                metaData.BoundingBox.minx,
                metaData.BoundingBox.maxy,
                metaData.BoundingBox.maxx).transform(new OpenLayers.Projection("EPSG:4326"),new OpenLayers.Projection("EPSG:900913"));

            editOverlayLayer = new OpenLayers.Layer.TileStream( metaData.tileDB,
                "http://localhost:8888/", {layername: metaData.tileDB,
                    minResolution:metaData.TileSet.minRes,
                    maxResolution:metaData.TileSet.maxRes,
                    maxExtent:bounds,
                    type:'png',
                    isBaseLayer:false,
                    serviceVersion:'v2',
                    transitionEffect:'resize',
                    buffer:3});

            editOverlayLayer.setZIndex(250);

            OLmap.addLayer(editOverlayLayer);
        },
        removeEditOverlayLayer : function(){
            if(editOverlayLayer) OLmap.removeLayer(editOverlayLayer);
            editOverlayLayer = null;
        },
        setFeatureLayer : function(){

            if(featureLayer){
                OLmap.removeLayer(featureLayer);
            }

            featureLayer = new OpenLayers.Layer.Vector("Features",{
                styleMap: featureStyle,
                rendererOptions: { zIndexing: true }
            });

            featureLayer.setZIndex(300);

            OLmap.addLayer(featureLayer);

        },
        addFeature : function(feature){

            if(featureLayer) featureLayer.addFeatures(feature);

        },
        removeFeature : function(feature){
            if(featureLayer) featureLayer.removeFeatures([feature]);

        },
        removeAllFeatures : function(){
            if(featureLayer) featureLayer.removeAllFeatures();

        },
        setEditFeatureLayer : function(){
            if(editFeatureLayer){
                OLmap.removeLayer(editFeatureLayer);
            }

            editFeatureLayer = new OpenLayers.Layer.Vector("Edit",{
                styleMap: featureEditStyle,
                rendererOptions: { zIndexing: true }
            });

            editFeatureLayer.setZIndex(400);

            OLmap.addLayer(editFeatureLayer);



            drawControl = {
                point: new OpenLayers.Control.DrawFeature(editFeatureLayer,
                    OpenLayers.Handler.Point,{featureAdded : featureAdded}),
                line: new OpenLayers.Control.DrawFeature(editFeatureLayer,
                    OpenLayers.Handler.Path,{featureAdded : featureAdded}),
                poly: new OpenLayers.Control.DrawFeature(editFeatureLayer,
                    OpenLayers.Handler.Polygon,{featureAdded : featureAdded})
            };

            OLmap.addControl(drawControl.point);
            OLmap.addControl(drawControl.line);
            OLmap.addControl(drawControl.poly);

            modifyControl = new OpenLayers.Control.ModifyFeature(editFeatureLayer, {vertexRenderIntent: "vertex"});

            OLmap.addControl(modifyControl);

        },
        addEditFeature : function(feature){

            if(feature.typ == 'pointOri') editFeatureLayer.styleMap = featureEditStyleOri;
            else editFeatureLayer.styleMap = featureEditStyle;

            if(editFeatureLayer) editFeatureLayer.addFeatures(feature.feature);

        },
        drawFeature : function(type,colorRot,callback){

            featureAddedCallback = callback;

            if(type == 'pointOri'){
                editFeatureLayer.styleMap = featureEditStyleOri;

                featureCreateStyleOri.styles.default.defaultStyle.rotation = colorRot;
            }
            else{
                editFeatureLayer.styleMap = featureEditStyle;

                featureCreateStyle.styles.default.defaultStyle.strokeColor = colorRot;
                featureCreateStyle.styles.default.defaultStyle.fillColor = colorRot;
            }

            switch (type) {
                case "point":
                    drawControl.point.handler.layerOptions.styleMap = featureCreateStyle;
                    drawControl.point.activate();
                    break;
                case "pointOri":
                    drawControl.point.handler.layerOptions.styleMap = featureCreateStyleOri;
                    drawControl.point.activate();
                    break;
                case "line":
                    drawControl.line.handler.layerOptions.styleMap = featureCreateStyle;
                    drawControl.line.activate();
                    break;
                case "poly":
                    drawControl.poly.handler.layerOptions.styleMap = featureCreateStyle;
                    drawControl.poly.activate();
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
                case "pointOri": drawControl.point.deactivate();
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
        modifyFeature : function(feature){
            modifyControl.activate();
            modifyControl.selectFeature(feature);
            editFeatureLayer.redraw();
        },
        stopModifyFeature : function(){
            modifyControl.deactivate();
        },
        removeAllEditFeature : function(){
            if(editFeatureLayer) editFeatureLayer.removeAllFeatures();
        },
        redrawEditFeatureLayer : function(){
            if(editFeatureLayer) editFeatureLayer.redraw();
        }





    };
  });
