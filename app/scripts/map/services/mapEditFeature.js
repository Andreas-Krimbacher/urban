'use strict';
/**
 * Service for Info-Einheit editing
 * @name Service:mapEditFeature
 * @namespace
 * @author Andreas Krimbacher
 */
angular.module('udm.map')
  .factory('mapEditFeature', function (OpenLayersMap) {
		/**
         * base plan layer
         * @name Service:mapEditFeature#baseLayer
         * @private
         * @type {object}
         */
        var baseLayer = null;
		/**
         * array for the overlay plan layers
         * @name Service:mapEditFeature#overlayLayers
         * @private
         * @type {Array(object)}
         */
        var overlayLayers = [];
		/**
         * vector feature layer
         * @name Service:mapEditFeature#featureLayer
         * @private
         * @type {object}
         */
        var featureLayer = null;
		/**
         * vector feature edit layer
         * @name Service:mapEditFeature#editFeatureLayer
         * @private
         * @type {object}
         */
        var editFeatureLayer = null;
		/**
         * overlay plan edit layer
         * @name Service:mapEditFeature#editOverlayLayer
         * @private
         * @type {object}
         */
        var editOverlayLayer = null;

		/**
         * z-index count for the overlay layers
         * @name Service:mapEditFeature#overlayLayerZIndexCount
         * @private
         * @type {integer}
         */
        var overlayLayerZIndexCount = 0;

		/**
         * vector feature draw control
         * @name Service:mapEditFeature#drawControl
         * @private
         * @type {object}
         */
        var drawControl = null;
		/**
         * vector feature modify control
         * @name Service:mapEditFeature#modifyControl
         * @private
         * @type {object}
         */
        var modifyControl = null;

		//helper function
        var featureAdded = function(feature){
           if(featureAddedCallback) featureAddedCallback(feature);
        };
		/**
         * callback when a feature is added
         * @name Service:mapEditFeature#featureAddedCallback
         * @private
         * @type {function}
         */
        var featureAddedCallback = null;

		/**
         * openlayers map object
         * @name Service:mapEditFeature#OLmap
         * @private
         * @type {function}
         */
        var OLmap = OpenLayersMap.getMap();


		/**
         * style for the vector feature
         * @name Service:mapEditFeature#featureStyle
         * @private
         * @type {object}
         */
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

		/**
         * style for the vector feature editing
         * @name Service:mapEditFeature#featureEditStyle
         * @private
         * @type {object}
         */
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

		/**
         * style for the oriented point vector feature editing 
         * @name Service:mapEditFeature#featureEditStyleOri
         * @private
         * @type {object}
         */
        var featureEditStyleOri = new OpenLayers.StyleMap({
            "default": new OpenLayers.Style({
                fillOpacity: 1,
                'pointRadius':25,
                rotation:"${rot}",
                externalGraphic: '/styles/images/viewpoint.png'
            })
        });

		/**
         * style for the vector feature creation 
         * @name Service:mapEditFeature#featureCreateStyle
         * @private
         * @type {object}
         */
        var featureCreateStyle = new OpenLayers.StyleMap({
            "default": new OpenLayers.Style({
                strokeOpacity: 1,
                strokeWidth: 4,
                fillOpacity: 0.8,
                pointRadius: 7
            })
        });

		/**
         * style for the oriented point vector feature creation 
         * @name Service:mapEditFeature#featureCreateStyleOri
         * @private
         * @type {object}
         */
        var featureCreateStyleOri = new OpenLayers.StyleMap({
            "default": new OpenLayers.Style({
                fillOpacity: 1,
                'pointRadius':25,
                externalGraphic: '/styles/images/viewpoint.png'
            })
        });


    // Public API here
    return {
		/**
         * set all layer variables to null
         * @name  Service:mapEditFeature#clearAllLayers
         * @function
         */
        clearAllLayer : function(){
            baseLayer = null;
            overlayLayers = [];
            featureLayer = null;
            editFeatureLayer = null;
            editOverlayLayer = null;
        },
		/**
         * set a base plan layer
         * @name  Service:mapEditFeature#setBaseLayer
         * @function
		 * @param metaData {object} plan metadata
         */
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
		/**
         * remove base plan layer
         * @name  Service:mapEditFeature#removeBaseLayer
         * @function
         */
        removeBaseLayer : function(){
            if(baseLayer) OLmap.removeLayer(baseLayer);
            baseLayer = null;
        },
		/**
         * add a overlay plan layer
         * @name  Service:mapEditFeature#addOverlayLayer
         * @function
		 * @param metaData {object} plan metadata
         */
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
		/**
         * remove overlay plan layer
         * @name  Service:mapEditFeature#removeOverlayLayer
         * @function
		 * @param metaData {object} plan metadata
         */
        removeOverlayLayer : function(metaData){
          for(var x = 0; x < overlayLayers.length; x++){
              if(overlayLayers[x].name == metaData.tileDB){
                  OLmap.removeLayer(overlayLayers[x].layer);
                  overlayLayers.splice(x,1);
              }
          }

        },
		/**
         * remove all overlay plan layer
         * @name  Service:mapEditFeature#removeAllOverlayLayer
         * @function
         */
        removeAllOverlayLayer : function(){
            for(var x = 0; x < overlayLayers.length; x++){
                    OLmap.removeLayer(overlayLayers[x].layer);
            }
            overlayLayers = [];

        },
		/**
         * set the overlay edit plan layer
         * @name  Service:mapEditFeature#setEditOverlayLayer
         * @function
		 * @param metaData {object} plan metadata
         */
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
		/**
         * remove the overlay edit plan layer
         * @name  Service:mapEditFeature#removeEditOverlayLayer
         * @function
         */
        removeEditOverlayLayer : function(){
            if(editOverlayLayer) OLmap.removeLayer(editOverlayLayer);
            editOverlayLayer = null;
        },
		/**
         * initilaize vector feature layer
         * @name  Service:mapEditFeature#setFeatureLayer
         * @function
         */
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
		/**
         * add feature to the vector feature layer
         * @name  Service:mapEditFeature#addFeature
         * @function
		 * @param feature {object} openlayers feature
         */
        addFeature : function(feature){
            if(featureLayer) featureLayer.addFeatures(feature);
        },
		/**
         * remove feature from the vector feature layer
         * @name  Service:mapEditFeature#removeFeature
         * @function
		 * @param feature {object} openlayers feature
         */
        removeFeature : function(feature){
            if(featureLayer) featureLayer.removeFeatures([feature]);

        },
		/**
         * remove all feature from the vector feature layer
         * @name  Service:mapEditFeature#removeAllFeatures
         * @function
         */
        removeAllFeatures : function(){
            if(featureLayer) featureLayer.removeAllFeatures();

        },
		/**
         * initilaize edit vector feature layer
         * @name  Service:mapEditFeature#setEditFeatureLayer
         * @function
         */
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
		/**
         * add feature to the edit vector feature layer
         * @name  Service:mapEditFeature#addEditFeature
         * @function
		 * @param feature {object} openlayers feature
         */
        addEditFeature : function(feature){
            if(feature.typ == 'pointOri') editFeatureLayer.styleMap = featureEditStyleOri;
            else editFeatureLayer.styleMap = featureEditStyle;

            if(editFeatureLayer) editFeatureLayer.addFeatures(feature.feature);
        },
		/**
         * start add feature process on edit vector feature layer
         * @name  Service:mapEditFeature#drawFeature
         * @function
		 * @param type {string} feature type (pointOri,point,line,poly)
         */
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
		/**
         * stop add feature process on edit vector feature layer
         * @name  Service:mapEditFeature#stopDrawFeature
         * @function
         */
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
		/**
         * modifyFeature feature on edit vector feature layer
         * @name  Service:mapEditFeature#modifyFeature
         * @function
		 * @param feature {object} openlayers feature
         */
        modifyFeature : function(feature){
            modifyControl.activate();
            modifyControl.selectFeature(feature);
            editFeatureLayer.redraw();
        },
		/**
         * stop modifyFeature feature on edit vector feature layer
         * @name  Service:mapEditFeature#modifyFeature
         * @function
         */
        stopModifyFeature : function(){
            modifyControl.deactivate();
        },
		/**
         * remove all feature on edit vector feature layer
         * @name  Service:mapEditFeature#removeAllEditFeature
         * @function
         */
        removeAllEditFeature : function(){
            if(editFeatureLayer) editFeatureLayer.removeAllFeatures();
        },
		/**
         * redraw edit vector feature layer
         * @name  Service:mapEditFeature#redrawEditFeatureLayer
         * @function
         */
        redrawEditFeatureLayer : function(){
            if(editFeatureLayer) editFeatureLayer.redraw();
        }
    };
  });
