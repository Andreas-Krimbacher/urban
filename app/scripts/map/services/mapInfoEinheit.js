'use strict';
/**
 * Service for showing Info-Einheiten
 * @name Service:mapInfoEinheit
 * @namespace
 * @author Andreas Krimbacher
 */
angular.module('udm.map')
    .factory('mapInfoEinheit', function (OpenLayersMap,util) {
		/**
         * top container for all layer packages, one layer package contains all layers from on Info-Einheit
         * @name Service:mapInfoEinheit#layerPackages
         * @private
         * @type {object}
         */
        var layerPackages = {};

		/**
         * z-Index for the next Info-Einheit that should be shown on top
         * @name Service:mapInfoEinheit#nextZindexTop
         * @private
         * @type {integer}
         */
        var nextZindexTop = 1000;

		/**
         * openlayers map object
         * @name Service:mapInfoEinheit#currentZoom
         * @private
         * @type {object}
         */
        var OLmap = OpenLayersMap.getMap();

		/**
         * flag for animations
         * @name Service:mapInfoEinheit#showAnimation
         * @private
         * @type {boolean}
         */
        var showAnimation = false;

		/**
         * style for the vector feature
         * @name Service:mapEditFeature#featureStyle
         * @private
         * @type {object}
         */
        var featureStyle = new OpenLayers.StyleMap({
            "default": new OpenLayers.Style(),
            "temporary": new OpenLayers.Style(),
            "select": new OpenLayers.Style()
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
            "start" : {
                strokeColor:'${color}',
                strokeOpacity: .7,
                strokeWidth: 6,
                pointRadius: 6,
                fillColor:'${color}',
                fillOpacity: 0.4,
                cursor: "default",
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

        var lookupTemporary = {
            "point": {
                strokeColor: '#ab1818',
                strokeOpacity: 1,
                strokeWidth: 4,
                fillColor: '#ab1818',
                fillOpacity: 0.8,
                pointRadius: 7,
                cursor: "pointer",
                graphicZIndex: '${zIndex}'
            },
            "poly": {
                strokeColor: '#ab1818',
                strokeOpacity: 1,
                strokeWidth: 6,
                fillColor: '#ab1818',
                fillOpacity: 0.7,
                pointRadius: 6,
                cursor: "pointer",
                graphicZIndex: '${zIndex}'
            },
            "line" : {
                strokeColor: '#ab1818',
                strokeOpacity: 1,
                strokeWidth: 6,
                fillColor: '#ab1818',
                fillOpacity: 0.7,
                pointRadius: 6,
                cursor: "pointer",
                graphicZIndex: '${zIndex}'
            },
            "start" : {
                strokeColor: '#ab1818',
                strokeOpacity: 1,
                strokeWidth: 6,
                fillColor: '#ab1818',
                fillOpacity: 0.7,
                pointRadius: 6,
                cursor: "default",
                graphicZIndex: '${zIndex}'
            },
            "pointOri" : {
                fillOpacity: 1,
                'pointRadius':25,
                rotation:"${rot}",
                cursor: "pointer",
                externalGraphic: '/styles/images/viewpointRed.png'
            }
        };

        featureStyle.addUniqueValueRules("temporary", "typ", lookupTemporary);

        var lookupSelect = {
            "point": {
                strokeColor: '#ab1818',
                strokeOpacity: 1,
                strokeWidth: 4,
                fillColor: '#ab1818',
                fillOpacity: 0.8,
                pointRadius: 7,
                cursor: "default",
                graphicZIndex: '${zIndex}'
            },
            "poly": {
                strokeColor: '#ab1818',
                strokeOpacity: 1,
                strokeWidth: 6,
                fillColor: '#ab1818',
                fillOpacity: 0.7,
                pointRadius: 6,
                cursor: "default",
                graphicZIndex: '${zIndex}'
            },
            "line" : {
                strokeColor: '#ab1818',
                strokeOpacity: 1,
                strokeWidth: 6,
                fillColor: '#ab1818',
                fillOpacity: 0.7,
                pointRadius: 6,
                cursor: "default",
                graphicZIndex: '${zIndex}'
            },
            "start" : {
                strokeColor: '#ab1818',
                strokeOpacity: 1,
                strokeWidth: 6,
                fillColor: '#ab1818',
                fillOpacity: 0.7,
                pointRadius: 6,
                cursor: "default",
                graphicZIndex: '${zIndex}'
            },
            "pointOri" : {
                fillOpacity: 1,
                'pointRadius':25,
                rotation:"${rot}",
                cursor: "default",
                externalGraphic: '/styles/images/viewpointRed.png'
            }
        };

        featureStyle.addUniqueValueRules("select", "typ", lookupSelect);


		/**
         * calculate the z-index for all layer in the layerPackage 
         * @name  Service:mapEditFeature#calculateZindex
         * @function
         * @private
		 * @param layerPackage {object} layer package of the Info-Einheit
		 * @param infoEinheit {object} Info-Einheit
		 * @param position {string} (top) only top supported yet
         */
        var calculateZindex = function(layerPackage,infoEinheit,position){
            var adjustZindexFlag = false;

            if(position == 'top'){
                var zIndexBase = nextZindexTop;
                nextZindexTop = nextZindexTop + 100;
                if(nextZindexTop > 2000)  adjustZindexFlag = true;
            }

            layerPackage.zIndexBase = zIndexBase;
            var x;
            for(x = 0; x < infoEinheit.features.length; x++){
                if(infoEinheit.features[x].typ == 'plan'){
                    layerPackage.baseLayer[infoEinheit.features[x].id] = {};
                    layerPackage.baseLayer[infoEinheit.features[x].id].zIndex = zIndexBase;
                }
                else if(infoEinheit.features[x].typ == 'planOverlay'){
                    layerPackage.overlayLayer[infoEinheit.features[x].id] = {};
                    layerPackage.overlayLayer[infoEinheit.features[x].id].zIndex = zIndexBase+1;
                }
                else{
                    layerPackage.featureLayer.zIndex = zIndexBase+2;
                }
            }

            return adjustZindexFlag;

        };

		/**
         * re-calculate the z-index of all layer packages
         * @name  Service:mapEditFeature#adjustZindex
         * @function
         * @private
         */
        var adjustZindex = function(){
            var y;
            var length = 0;
            for(var x in layerPackages){
                length++;
            }

            var topZindex = 1000 + (length-1)*100;

            for(x in layerPackages){
                layerPackages[x].zIndexBase = topZindex - layerPackages[x].infoEinheit.layerStackPosition * 100;
                nextZindexTop = nextZindexTop + 100;
                for(y in layerPackages[x].baseLayer){
                    if(layerPackages[x].baseLayer[y].zIndex) layerPackages[x].baseLayer[y].zIndex = layerPackages[x].zIndexBase;
                }
                for(y in layerPackages[x].overlayLayer){
                    if(layerPackages[x].overlayLayer[y].zIndex) layerPackages[x].overlayLayer[y].zIndex = layerPackages[x].zIndexBase+1;
                }
                if(layerPackages[x].featureLayer.zIndex) layerPackages[x].featureLayer.zIndex = layerPackages[x].zIndexBase+2;

                setZindexPackage(layerPackages[x]);
            }
        };

		/**
         * add a plan as tile layer to the map
         * @name  Service:mapEditFeature#addTileLayer
         * @function
         * @private
		 * @param metaData {object} plan metaData
		 * @param zIndex {integer} z-Index
         */
        var addTileLayer = function(metaData,zIndex){

            var bounds = new OpenLayers.Bounds(metaData.BoundingBox.miny,
                metaData.BoundingBox.minx,
                metaData.BoundingBox.maxy,
                metaData.BoundingBox.maxx).transform(new OpenLayers.Projection("EPSG:4326"),new OpenLayers.Projection("EPSG:900913"));

            var tileLayer = new OpenLayers.Layer.TileStream( metaData.tileDB,
                "http://localhost:8888/", {layername: metaData.tileDB,
                    minResolution:0,
                    maxResolution:metaData.TileSet.maxRes,
                    maxExtent:bounds,
                    type:'png',
                    isBaseLayer:false,
                    serviceVersion:'v2',
                    transitionEffect:'resize',
                    buffer:3});

            if(showAnimation){
                tileLayer.opacity = 0;

                var tween = new OpenLayers.Tween(OpenLayers.Easing.Quad.easeOut);
                tileLayer.events.register('loadend',this, function(){
                    tileLayer.events.remove('loadend');
                    var callbacks =  {
                        eachStep: function(value) {
                            tileLayer.setOpacity(value.opacity/100);
                        }
                    };
                    tween.start({opacity:0}, {opacity:100}, 50, {callbacks: callbacks});
                });
            }

            tileLayer.setZIndex(zIndex);

            OLmap.addLayer(tileLayer);

            return tileLayer;
        };

		/**
         * remove a tile layer from the map
         * @name  Service:mapEditFeature#removeTileLayer
         * @function
         * @private
		 * @param layer {object} openlayers layer object
         */
        var removeTileLayer = function(layer){
            if(showAnimation){
                var tween = new OpenLayers.Tween(OpenLayers.Easing.Quad.easeOut);

                var callbacks =  {
                    eachStep: function(value) {
                        layer.setOpacity(value.opacity/100);
                        if(value.opacity == 0) OLmap.removeLayer(layer);
                    }
                };
                tween.start({opacity:layer.opacity*100}, {opacity:0}, 50*layer.opacity, {callbacks: callbacks});
            }
            else{
                OLmap.removeLayer(layer);
            }
        };

		/**
         * initialize a vector layer with controls
         * @name  Service:mapEditFeature#createFeatureLayer
         * @function
         * @private
		 * @param zIndex {integer} z-Index
         */
        var createFeatureLayer = function(zIndex){
            var featureLayer = new OpenLayers.Layer.Vector("Features",{
                styleMap: featureStyle,
                rendererOptions: { zIndexing: true }
            });


            var hoverControl = new OpenLayers.Control.SelectFeature(featureLayer,{hover: true,
                highlightOnly: true,
                renderIntent: "temporary"
            });
            OLmap.addControl(hoverControl);
            hoverControl.activate();

            featureLayer.hoverControl = hoverControl;

            //only top layer can be selected!!!
            var selectControl = new OpenLayers.Control.SelectFeature(featureLayer,{
                clickout: false,
                onSelect:function(feature){
                    if(!feature.attributes.preventEvent) feature.attributes.onSelect(feature);
                    else feature.attributes.preventEvent = false;
                },
                clickFeature:function(feature){
                    for(var x = 0; x < feature.layer.selectedFeatures.length; x++){
                        if(feature.layer.selectedFeatures[x] == feature){
                            if(!feature.attributes.preventEvent) feature.attributes.onSelect(feature);
                            else feature.attributes.preventEvent = false;
                            return;
                        }
                    }
                    feature.layer.selectControl.select(feature);
                },
                onUnselect:function(feature){
                    if(!feature.attributes.preventEvent) feature.attributes.onSelect();
                    else feature.attributes.preventEvent = false;
                }});
            OLmap.addControl(selectControl);
            selectControl.activate();

            featureLayer.selectControl = selectControl;

            featureLayer.setZIndex(zIndex);

            return featureLayer;
        };

		/**
         * re-initialize the select control of a vector layer
         * @name  Service:mapEditFeature#createFeatureLayer
         * @function
         * @private
		 * @param featureLayer {object} openlayers layer object
         */
        var resetSelectControl = function(featureLayer){

            featureLayer.hoverControl.deactivate();
            OLmap.removeControl(featureLayer.hoverControl);

            var hoverControl = new OpenLayers.Control.SelectFeature(featureLayer,{hover: true,
                highlightOnly: true,
                renderIntent: "temporary"
            });
            OLmap.addControl(hoverControl);
            hoverControl.activate();

            featureLayer.hoverControl = hoverControl;


            featureLayer.selectControl.deactivate();
            OLmap.removeControl(featureLayer.selectControl);

            //only top layer can be selected!!!
            var selectControl = new OpenLayers.Control.SelectFeature(featureLayer,{
                clickout: false,
                onSelect:function(feature){
                    if(!feature.attributes.preventEvent) feature.attributes.onSelect(feature);
                    else feature.attributes.preventEvent = false;
                },
                clickFeature:function(feature){
                    for(var x = 0; x < feature.layer.selectedFeatures.length; x++){
                        if(feature.layer.selectedFeatures[x] == feature){
                            if(!feature.attributes.preventEvent) feature.attributes.onSelect(feature);
                            else feature.attributes.preventEvent = false;
                            return;
                        }
                    }
                    feature.layer.selectControl.select(feature);
                },
                onUnselect:function(feature){
                    if(!feature.attributes.preventEvent) feature.attributes.onSelect();
                    else feature.attributes.preventEvent = false;
                }});
            OLmap.addControl(selectControl);
            selectControl.activate();

            featureLayer.selectControl = selectControl;

        };

		/**
         * add vector layer to the map
         * @name  Service:mapEditFeature#addFeatureLayer
         * @function
         * @private
		 * @param layer {object} openlayers layer object
         */
        var addFeatureLayer = function(layer){

            if(showAnimation) layer.setOpacity(0);
            OLmap.addLayer(layer);

            if(showAnimation){
                var tween = new OpenLayers.Tween(OpenLayers.Easing.Quad.easeOut);

                var callbacks =  {
                    eachStep: function(value) {
                        layer.setOpacity(value.opacity/100);
                    }
                };

                tween.start({opacity:0}, {opacity:100}, 50, {callbacks: callbacks});
            }


        };

		/**
         * remove vector layer from the map
         * @name  Service:mapEditFeature#removeFeatureLayer
         * @function
         * @private
		 * @param layer {object} openlayers layer object
         */
        var removeFeatureLayer = function(layer){

            if(showAnimation){
                var tween = new OpenLayers.Tween(OpenLayers.Easing.Quad.easeOut);

                var callbacks =  {
                    eachStep: function(value) {
                        layer.setOpacity(value.opacity/100);
                        if(value.opacity == 0){
                            layer.selectControl.deactivate();
                            OLmap.removeControl(layer.selectControl);

                            layer.hoverControl.deactivate();
                            OLmap.removeControl(layer.hoverControl);

                            OLmap.removeLayer(layer);
                        }
                    }
                };
                tween.start({opacity:layer.opacity*100}, {opacity:0}, 50*layer.opacity, {callbacks: callbacks});
            }
            else{
                layer.selectControl.deactivate();
                OLmap.removeControl(layer.selectControl);

                layer.hoverControl.deactivate();
                OLmap.removeControl(layer.hoverControl);

                OLmap.removeLayer(layer);
            }
        };

		/**
         * add a feature to a vector layer
         * @name  Service:mapEditFeature#addFeatureToLayer
         * @function
         * @private
		 * @param feature {object} openlayers feature
		 * @param layer {object} openlayers layer object
         */
        var addFeatureToLayer = function(feature,layer){
            layer.addFeatures([feature]);
        };

		/**
         * add a tooltip to a vector feature
         * @name  Service:mapEditFeature#addTooltip
         * @function
         * @private
		 * @param feature {object} openlayers feature
         */
        var addTooltip = function(feature){
            $('[id="'+feature.feature.geometry.id+'"]').data('powertip', feature.title).powerTip({placement:'se',
                followMouse : true
            });
        };

		/**
         * add a label to a vector feature
         * @name  Service:mapEditFeature#addLabel
         * @function
         * @private
		 * @param feature {object} openlayers feature
         */
        var addLabel = function(feature){
            var center = feature.feature.geometry.getBounds().getCenterLonLat();
            var position = OLmap.getLayerPxFromViewPortPx(OLmap.getViewPortPxFromLonLat(center));
            $('[id="OpenLayers.Map_2_OpenLayers_Container"]').append('<div id="label_'+feature.id+'" class="mapLabel">'+feature.title+'</div>');
            $('#label_'+feature.id).css('top',position.y-15+'px').css('left',position.x-60+'px');
        };

		/**
         * set the z-index of a layer
         * @name  Service:mapEditFeature#setZindexLayer
         * @function
         * @private
		 * @param layer {object} openlayers layer object
		 * @param zIndex {integer} z-Index
		 * @param type {string} change type (fadeIn,fadeOut) showAnimation must be true
         */
        var setZindexLayer = function(layer,zIndex,type){
            type = '';
			
            if(type == 'fadeIn' && showAnimation){
                var preOpacity = layer.opacity;

                var tween = new OpenLayers.Tween(OpenLayers.Easing.Quad.easeOut);

                var callbacks =  {
                    eachStep: function(value) {
                        layer.setOpacity(value.opacity/100);
                    }
                };

                layer.setOpacity(0);
                layer.setZIndex(zIndex);

                tween.start({opacity:0}, {opacity:preOpacity*100}, 20*preOpacity, {callbacks: callbacks});
            }
            else if(type == 'fadeOut' && showAnimation){

                (function( layer ) {
                    var preOpacity = layer.opacity;

                    var tween = new OpenLayers.Tween(OpenLayers.Easing.Quad.easeOut);

                    var callbacks =  {
                        eachStep: function(value) {
                            layer.setOpacity(value.opacity/100);
                            if(value.opacity == 0) layer.redraw();
                        }
                    };

                    tween.start({opacity:preOpacity*100}, {opacity:0}, 20*preOpacity, {callbacks: callbacks});

                    layer.setZIndex(zIndex);
                    layer.setOpacity(preOpacity);
                })( layer );
            }
            else{
                layer.setZIndex(zIndex);
            }
        };

		/**
         * applay the z-Index in the layer Package to the layer in the layer package
         * @name  Service:mapEditFeature#setZindexPackage
         * @function
         * @private
		 * @param layerPackage {object} layer package
		 * @param type {string} change type (fadeIn,fadeOut) showAnimation must be true
         */
        var setZindexPackage = function(layerPackage,type){
            var x;
            for(x in layerPackage.baseLayer){
                if(layerPackage.baseLayer[x].zIndex) setZindexLayer(layerPackage.baseLayer[x].layer,layerPackage.baseLayer[x].zIndex,type);
            }
            for(x in layerPackage.overlayLayer){
                if(layerPackage.overlayLayer[x].zIndex) setZindexLayer(layerPackage.overlayLayer[x].layer,layerPackage.overlayLayer[x].zIndex,type);
            }
            if(layerPackage.featureLayer.layer){
                if(layerPackage.featureLayer.zIndex) setZindexLayer(layerPackage.featureLayer.layer,layerPackage.featureLayer.zIndex,type);
            }

        };

		/**
         * remove Info-Einheit from map
         * @name  Service:mapEditFeature#removeInfoEinheit
         * @function
         * @private
		 * @param id {integer} Id Info-Einheit
         */
        var removeInfoEinheit = function(id){
            var x;
            if(layerPackages[id]){
                for(x in layerPackages[id].baseLayer){
                    if(layerPackages[id].baseLayer[x].layer) removeTileLayer(layerPackages[id].baseLayer[x].layer);
                }
                for(x in layerPackages[id].overlayLayer){
                    if(layerPackages[id].overlayLayer[x].layer) removeTileLayer(layerPackages[id].overlayLayer[x].layer);
                }
                if(layerPackages[id].featureLayer.layer){
                    removeFeatureLayer(layerPackages[id].featureLayer.layer);
                    if(layerPackages[id].featureLayer.hasLabel){
                        $('.mapLabel').remove();
                        OLmap.events.remove('zoomend');
                    }
                }

                nextZindexTop = 200;
                for(x in layerPackages){
                    if((layerPackages[x] != layerPackages[id]) && nextZindexTop < layerPackages[x].zIndexBase)
                        nextZindexTop = layerPackages[x].zIndexBase;
                }
                if(nextZindexTop < 900) nextZindexTop = 900;
                nextZindexTop = nextZindexTop + 100;

                delete layerPackages[id];
            }
        };

        // Public API here
        return {
			/**
			 * reset the map
			 * @name  Service:mapEditFeature#resetMap
			 * @function
			 */
            resetMap : function(){
                OpenLayersMap.resetMap();
            },
			/**
			 * set the layerPackages to an empty object
			 * @name  Service:mapEditFeature#clearAllLayers
			 * @function
			 */
            clearAllLayers : function(){
                layerPackages = {};
            },
			/**
			 * select a feature
			 * @name  Service:mapEditFeature#selectfeature
			 * @function
			 * @param feature {object} openlayers feature
			 */
            selectfeature : function(feature){
                for(var x in layerPackages){
                    if(layerPackages[x].featureLayer.layer){
                        for(var y = 0; y < layerPackages[x].featureLayer.layer.features.length; y++){
                            if(layerPackages[x].featureLayer.layer.features[y].attributes.id == feature.id){
                                layerPackages[x].featureLayer.layer.selectControl.select(layerPackages[x].featureLayer.layer.features[y]);
                                break;
                            }
                        }
                    }
                }
            },
			/**
			 * unselect a feature
			 * @name  Service:mapEditFeature#unselectfeature
			 * @function
			 * @param feature {object} openlayers feature
			 * @param preventEvent {boolean} flag, when true onUnselect callback will not be called
			 */
            unselectfeature : function(feature,preventEvent){
                for(var x in layerPackages){
                    if(layerPackages[x].featureLayer.layer){
                        for(var y = 0; y < layerPackages[x].featureLayer.layer.features.length; y++){
                            if(layerPackages[x].featureLayer.layer.features[y].attributes.id == feature.id){
                                layerPackages[x].featureLayer.layer.features[y].attributes.preventEvent = preventEvent;
                                layerPackages[x].featureLayer.layer.selectControl.unselect(layerPackages[x].featureLayer.layer.features[y]);
                                break;
                            }
                        }
                    }
                }
            },
			/**
			 * remove Info-EInheit at the bootom of the layer stack
			 * @name  Service:mapEditFeature#removeBottomInfoEinheit
			 * @function
			 */
            removeBottomInfoEinheit : function(){
                var id = null;
				//position 0 is top
                var position = 0;

                var x;
                for(x in layerPackages){
                    if(layerPackages[x].infoEinheit.layerStackPosition > position){
                        position = layerPackages[x].infoEinheit.layerStackPosition;
                        id = x;
                    }
                }

                if(id) removeInfoEinheit(id);
                return id;
            },
			/**
			 * add Info-Einheit to the map
			 * @name  Service:mapEditFeature#addInfoEinheit
			 * @function
			 * @param infoEinheit {object} Info-Einheit
			 * @param position {string} (top) only top supported yet
			 */
            addInfoEinheit : function(infoEinheit,position){
                if(layerPackages[infoEinheit.id]) removeInfoEinheit(infoEinheit.id);

                var layerPackage = {};
                layerPackage.baseLayer = {};
                layerPackage.overlayLayer = {};
                layerPackage.featureLayer = {};
                layerPackage.infoEinheit = infoEinheit;
                var adjustZindexFlag = calculateZindex(layerPackage,infoEinheit,position);

                var x;
                if(position == 'top'){
                    //0 is on top
                    layerPackage.infoEinheit.layerStackPosition = 0;
                    for(x in layerPackages){
                        layerPackages[x].infoEinheit.layerStackPosition = layerPackages[x].infoEinheit.layerStackPosition + 1;
                    }
                }

                infoEinheit.overlayLayer = {};
                infoEinheit.featureLayer = {};
                infoEinheit.baseLayer = {};

                for(x = 0; x < infoEinheit.features.length; x++){
                    if(infoEinheit.features[x].typ == 'plan' && !infoEinheit.features[x].hideInMap){
                        layerPackage.baseLayer[infoEinheit.features[x].id].layer = addTileLayer(infoEinheit.features[x].feature,layerPackage.baseLayer[infoEinheit.features[x].id].zIndex);

                        infoEinheit.baseLayer.visible = true;
                        if(typeof infoEinheit.features[x].opacity !== 'undefined'){
                            infoEinheit.baseLayer.opacity = infoEinheit.features[x].opacity;
                            layerPackage.baseLayer[infoEinheit.features[x].id].layer.setOpacity(infoEinheit.baseLayer.opacity);
                        }
                        else{
                            infoEinheit.baseLayer.opacity = 1;
                        }
                    }
                    else if(infoEinheit.features[x].typ == 'planOverlay' && !infoEinheit.features[x].hideInMap){
                        layerPackage.overlayLayer[infoEinheit.features[x].id].layer = addTileLayer(infoEinheit.features[x].feature,layerPackage.overlayLayer[infoEinheit.features[x].id].zIndex);

                        infoEinheit.overlayLayer[infoEinheit.features[x].id] = {};
                        infoEinheit.overlayLayer[infoEinheit.features[x].id].visible = true;
                        if(typeof infoEinheit.features[x].opacity  !== 'undefined'){
                            infoEinheit.overlayLayer[infoEinheit.features[x].id].opacity = infoEinheit.features[x].opacity;
                            layerPackage.overlayLayer[infoEinheit.features[x].id].layer.setOpacity(infoEinheit.overlayLayer[infoEinheit.features[x].id].opacity);
                        }
                        else{
                            infoEinheit.overlayLayer[infoEinheit.features[x].id].opacity = 1;
                        }

                    }
                    else if(!infoEinheit.features[x].hideInMap){
                        if(!layerPackage.featureLayer.layer){
                            layerPackage.featureLayer.layer = createFeatureLayer(layerPackage.featureLayer.zIndex);

                            infoEinheit.featureLayer.visible = true;
                            infoEinheit.featureLayer.opacity = 1;
                        }
                        addFeatureToLayer(infoEinheit.features[x].feature,layerPackage.featureLayer.layer);
                        if(infoEinheit.features[x].typ == 'start'){
                            layerPackage.featureLayer.layer.selectControl.deactivate();
                            layerPackage.featureLayer.hasLabel = true;
                        }
                    }
                }

                if(layerPackage.featureLayer.layer) addFeatureLayer(layerPackage.featureLayer.layer);

                if(layerPackage.featureLayer.hasLabel){
                    $('.mapLabel').remove();
                    for(x=0; x < infoEinheit.features.length; x++){
                        if(infoEinheit.features[x].typ != 'plan' && infoEinheit.features[x].typ != 'planOverlay'){
                            addLabel(infoEinheit.features[x]);
                        }
                    }

                    OLmap.events.register('zoomend', this, function(){
                        $('.mapLabel').remove();
                        for(x=0; x < infoEinheit.features.length; x++){
                            if(infoEinheit.features[x].typ != 'plan' && infoEinheit.features[x].typ != 'planOverlay'){
                                addLabel(infoEinheit.features[x]);
                            }
                        }
                    });
                }
                else{
                    for(x=0; x < infoEinheit.features.length; x++){
                        if(infoEinheit.features[x].typ != 'plan' && infoEinheit.features[x].typ != 'planOverlay'){
                            addTooltip(infoEinheit.features[x]);
                        }
                    }
                }

                layerPackages[infoEinheit.id] = layerPackage;

                if(adjustZindexFlag) adjustZindex();
            },
			/**
			 * change the Info-Einheit if it is already in the map, otherwise add it
			 * @name  Service:mapEditFeature#changeInfoEinheit
			 * @function
			 * @param infoEinheit {object} Info-Einheit
			 * @param position {string} (top) only top supported yet
			 */
            changeInfoEinheit : function(infoEinheit,position){
                var adjustZindexFlag = false;

                var x;
                if(!layerPackages[infoEinheit.id]){
                    var layerPackage = {};
                    layerPackage.baseLayer = {};
                    layerPackage.overlayLayer = {};
                    layerPackage.featureLayer = {};
                    layerPackage.infoEinheit = infoEinheit;


                    adjustZindexFlag = calculateZindex(layerPackage,infoEinheit,position);


                    if(position == 'top'){
                        //0 is on top
                        layerPackage.infoEinheit.layerStackPosition = 0;
                        for(x in layerPackages){
                            layerPackages[x].infoEinheit.layerStackPosition = layerPackages[x].infoEinheit.layerStackPosition + 1;
                        }
                    }

                    layerPackages[infoEinheit.id] = layerPackage;
                }

                infoEinheit.overlayLayer = {};
                infoEinheit.featureLayer = {};
                infoEinheit.baseLayer = {};

                $('.mapLabel').remove();
                OLmap.events.remove('zoomend');

                for(x in layerPackages[infoEinheit.id].baseLayer){
                    if(layerPackages[infoEinheit.id].baseLayer[x].layer)
                        layerPackages[infoEinheit.id].baseLayer[x].remove = true;
                }
                for(x in layerPackages[infoEinheit.id].overlayLayer){
                    if(layerPackages[infoEinheit.id].overlayLayer[x].layer)
                        layerPackages[infoEinheit.id].overlayLayer[x].remove = true;
                }
                if(layerPackages[infoEinheit.id].featureLayer.layer){
                    for(x=0; x < layerPackages[infoEinheit.id].featureLayer.layer.features.length; x++){
                        layerPackages[infoEinheit.id].featureLayer.layer.selectControl.unselect(layerPackages[infoEinheit.id].featureLayer.layer.features[x]);
                        layerPackages[infoEinheit.id].featureLayer.layer.features[x].remove = true;
                    }
                }

                for(x=0; x < infoEinheit.features.length; x++){
                    if(infoEinheit.features[x].typ == 'plan' && !infoEinheit.features[x].hideInMap){
                        if(!layerPackages[infoEinheit.id].baseLayer[infoEinheit.features[x].id].layer){
                            layerPackages[infoEinheit.id].baseLayer[infoEinheit.features[x].id].layer = addTileLayer(infoEinheit.features[x].feature,layerPackage.baseLayer[infoEinheit.features[x].id].zIndex);

                            layerPackages[infoEinheit.id].baseLayer[infoEinheit.features[x].id].remove = false;

                            infoEinheit.baseLayer.visible = true;
                            if(typeof infoEinheit.features[x].opacity !== 'undefined'){
                                infoEinheit.baseLayer.opacity = infoEinheit.features[x].opacity;
                                layerPackages[infoEinheit.id].baseLayer[infoEinheit.features[x].id].layer.setOpacity(infoEinheit.baseLayer.opacity);
                            }
                            else{
                                infoEinheit.baseLayer.opacity = 1;
                            }
                        }
                        else{
                            infoEinheit.baseLayer = layerPackages[infoEinheit.id].infoEinheit.baseLayer;
                            infoEinheit.baseLayer.opacity = 1;
                            layerPackages[infoEinheit.id].baseLayer[infoEinheit.features[x].id].layer.setOpacity(infoEinheit.baseLayer.opacity);
                            layerPackages[infoEinheit.id].baseLayer[infoEinheit.features[x].id].remove = false;
                        }
                    }
                    else if(infoEinheit.features[x].typ == 'planOverlay' && !infoEinheit.features[x].hideInMap){
                        if(!layerPackages[infoEinheit.id].overlayLayer[infoEinheit.features[x].id].layer){
                            layerPackages[infoEinheit.id].overlayLayer[infoEinheit.features[x].id].layer = addTileLayer(infoEinheit.features[x].feature,layerPackages[infoEinheit.id].overlayLayer[infoEinheit.features[x].id].zIndex);

                            layerPackages[infoEinheit.id].overlayLayer[infoEinheit.features[x].id].remove = false;

                            infoEinheit.overlayLayer[infoEinheit.features[x].id] = {};
                            infoEinheit.overlayLayer[infoEinheit.features[x].id].visible = true;
                            if(typeof infoEinheit.features[x].opacity  !== 'undefined'){
                                infoEinheit.overlayLayer[infoEinheit.features[x].id].opacity = infoEinheit.features[x].opacity;
                                layerPackages[infoEinheit.id].overlayLayer[infoEinheit.features[x].id].layer.setOpacity(infoEinheit.overlayLayer[infoEinheit.features[x].id].opacity);
                            }
                            else{
                                infoEinheit.overlayLayer[infoEinheit.features[x].id].opacity = 1;
                            }
                        }
                        else{
                            infoEinheit.overlayLayer = layerPackages[infoEinheit.id].infoEinheit.overlayLayer;
                            infoEinheit.overlayLayer.opacity = 1;
                            layerPackages[infoEinheit.id].overlayLayer[infoEinheit.features[x].id].layer.setOpacity(infoEinheit.overlayLayer.opacity);

                            layerPackages[infoEinheit.id].overlayLayer[infoEinheit.features[x].id].remove = false;
                        }

                    }
                    else if(!infoEinheit.features[x].hideInMap){
                        if(!layerPackages[infoEinheit.id].featureLayer.layer){
                            layerPackages[infoEinheit.id].featureLayer.layer = createFeatureLayer(layerPackages[infoEinheit.id].featureLayer.zIndex);

                            var newFeatureLayer = true;
                        }

                        infoEinheit.featureLayer.visible = true;
                        infoEinheit.featureLayer.opacity = 1;

                        var featureInMap = false;
                        for(var y = 0; y < layerPackages[infoEinheit.id].featureLayer.layer.features.length; y++){
                            if(layerPackages[infoEinheit.id].featureLayer.layer.features[y].attributes.id == infoEinheit.features[x].id){
                                featureInMap = true;
                                layerPackages[infoEinheit.id].featureLayer.layer.features[y].remove = false;
                            }
                        }

                        if(!featureInMap){
                            addFeatureToLayer(infoEinheit.features[x].feature,layerPackages[infoEinheit.id].featureLayer.layer);
                            if(infoEinheit.features[x].typ == 'start'){
                                layerPackages[infoEinheit.id].featureLayer.layer.selectControl.deactivate();
                                layerPackages[infoEinheit.id].featureLayer.hasLabel = true;
                            }
                        }
                    }
                }

                if(newFeatureLayer) addFeatureLayer(layerPackages[infoEinheit.id].featureLayer.layer);

                if(layerPackages[infoEinheit.id].featureLayer.hasLabel){
                    $('.mapLabel').remove();
                    for(x=0; x < infoEinheit.features.length; x++){
                        if(infoEinheit.features[x].typ != 'plan' && infoEinheit.features[x].typ != 'planOverlay'){
                            addLabel(infoEinheit.features[x]);
                        }
                    }

                    OLmap.events.register('zoomend', this, function(value){
                        $('.mapLabel').remove();
                        for(x=0; x < infoEinheit.features.length; x++){
                            if(infoEinheit.features[x].typ != 'plan' && infoEinheit.features[x].typ != 'planOverlay'){
                                addLabel(infoEinheit.features[x]);
                            }
                        }
                    });
                }
                else{
                    for(x=0; x < infoEinheit.features.length; x++){
                        if(infoEinheit.features[x].typ != 'plan' && infoEinheit.features[x].typ != 'planOverlay'){
                            addTooltip(infoEinheit.features[x]);
                        }
                    }
                }

                //Remove old stuff
                for(x in layerPackages[infoEinheit.id].baseLayer){
                    if(layerPackages[infoEinheit.id].baseLayer[x].remove){
                        removeTileLayer(layerPackages[infoEinheit.id].baseLayer[x].layer);
                        layerPackages[infoEinheit.id].baseLayer[x].layer = null;
                        layerPackages[infoEinheit.id].baseLayer[x].remove = false;
                    }
                }
                for(x in layerPackages[infoEinheit.id].overlayLayer){
                    if(layerPackages[infoEinheit.id].overlayLayer[x].remove){
                        removeTileLayer(layerPackages[infoEinheit.id].overlayLayer[x].layer);
                        layerPackages[infoEinheit.id].overlayLayer[x].layer = null;
                        layerPackages[infoEinheit.id].overlayLayer[x].remove = false;
                    }
                }
                if(layerPackages[infoEinheit.id].featureLayer.layer){
                    for(x = 0; x < layerPackages[infoEinheit.id].featureLayer.layer.features.length; x++){
                        if(layerPackages[infoEinheit.id].featureLayer.layer.features[x].remove)
                            layerPackages[infoEinheit.id].featureLayer.layer.removeFeatures([layerPackages[infoEinheit.id].featureLayer.layer.features[x]]);
                    }
                    if(layerPackages[infoEinheit.id].featureLayer.layer.features.length == 0){
                        removeFeatureLayer(layerPackages[infoEinheit.id].featureLayer.layer);
                        if(layerPackages[infoEinheit.id].featureLayer.hasLabel){
                            $('.mapLabel').remove();
                            OLmap.events.remove('zoomend');
                        }
                        layerPackages[infoEinheit.id].featureLayer.layer = null;
                    }
                }

                //reset select control
                if(layerPackages[infoEinheit.id].featureLayer.layer){
                    resetSelectControl(layerPackages[infoEinheit.id].featureLayer.layer);
                }

                if(adjustZindexFlag) adjustZindex();
            },
			/**
			 * remove Info-Einheit from map
			 * @name  Service:mapEditFeature#removeInfoEinheit
			 * @function
			 * @param id {integer} Id Info-Einheit
			 */
            removeInfoEinheit : function(id){
                removeInfoEinheit(id);
            },
			/**
			 * remove all Info-Einheiten from map
			 * @name  Service:mapEditFeature#removeAllInfoEinheiten
			 * @function
			 */
            removeAllInfoEinheiten : function(){
                for(var id in layerPackages){
                    removeInfoEinheit(id);
                }
            },
			/**
			 * set opacity of a Info-Feature
			 * @name  Service:mapEditFeature#setOpacity
			 * @function
			 * @param typ {string} only 'featureLayer' at the moment
			 * @param infoEinheitId {integer} Id Info-Einheit
			 * @param featureId {integer} Id Info-Feature of the layer
			 * @param value {float} opacity
			 */
            setOpacity : function(typ,infoEinheitId,featureId,value){
                if(layerPackages[infoEinheitId] && layerPackages[infoEinheitId][typ] && layerPackages[infoEinheitId][typ][featureId])
                    layerPackages[infoEinheitId][typ][featureId].layer.setOpacity(value);
            },
			/**
			 * toogle the visibility of a layer
			 * @name  Service:mapEditFeature#toggleVisibility
			 * @function
			 * @param typ {string} only 'featureLayer' at the moment
			 * @param infoEinheitId {integer} Id Info-Einheit
			 */
            toggleVisibility : function(typ,infoEinheitId){
                if(typ == 'featureLayer')
                    if(layerPackages[infoEinheitId] && layerPackages[infoEinheitId].featureLayer.layer){
                        layerPackages[infoEinheitId].featureLayer.layer.setVisibility(!layerPackages[infoEinheitId].featureLayer.layer.getVisibility());
                        layerPackages[infoEinheitId].featureLayer.visible = !layerPackages[infoEinheitId].featureLayer.visible;
                    }
            },
			/**
			 * change the position of a Info-Einheit in the layer stack
			 * @name  Service:mapEditFeature#changeOrder
			 * @function
			 * @param id {integer} Id Info-Einheit
			 * @param targetLevel {integer} target position in the layer stack
			 */
            changeOrder : function(id,targetLevel){

                var  adjustZindexFlag = false;

                if(targetLevel == layerPackages[id].infoEinheit.layerStackPosition) return;

                var above = null;
                var below = null;
                var zIndex = null;

                var type = 'fadeIn';
                if(layerPackages[id].infoEinheit.layerStackPosition < targetLevel) type = 'fadeOut';

                var x;
                if(layerPackages[id].infoEinheit.layerStackPosition < targetLevel){ //to the back
                    for(x in layerPackages){
                        if(layerPackages[x].infoEinheit.layerStackPosition == targetLevel+1) below = layerPackages[x].zIndexBase;
                        if(layerPackages[x].infoEinheit.layerStackPosition == targetLevel) above = layerPackages[x].zIndexBase;

                        if(layerPackages[x] != layerPackages[id]){
                            if((layerPackages[x].infoEinheit.layerStackPosition > layerPackages[id].infoEinheit.layerStackPosition) && (layerPackages[x].infoEinheit.layerStackPosition <= targetLevel))
                                layerPackages[x].infoEinheit.layerStackPosition--; //readjust layerStackPosition
                        }
                    }
                    if(below == null){
                        zIndex = 2000;
                        for(x in layerPackages){
                            if(layerPackages[x].zIndexBase < zIndex) zIndex = layerPackages[x].zIndexBase;
                        }
                        zIndex = zIndex - 100;
                        if(zIndex < 300)  adjustZindexFlag = true;
                    }
                    else{
                        zIndex = above - below;
                        if(zIndex < 10)  adjustZindexFlag = true;
                        zIndex = Math.round(below + zIndex/2);
                    }
                }
                if(layerPackages[id].infoEinheit.layerStackPosition > targetLevel){ //to the front
                    for(x in layerPackages){
                        if(layerPackages[x].infoEinheit.layerStackPosition == targetLevel) below = layerPackages[x].zIndexBase;
                        if(layerPackages[x].infoEinheit.layerStackPosition == targetLevel-1) above = layerPackages[x].zIndexBase;

                        if(layerPackages[x] != layerPackages[id]){
                            if((layerPackages[x].infoEinheit.layerStackPosition < layerPackages[id].infoEinheit.layerStackPosition) && (layerPackages[x].infoEinheit.layerStackPosition >= targetLevel))
                                layerPackages[x].infoEinheit.layerStackPosition++; //readjust layerStackPosition
                        }
                    }
                    if(above == null){
                        zIndex = nextZindexTop;
                        nextZindexTop = nextZindexTop + 100;
                        if(nextZindexTop > 2000)  adjustZindexFlag = true;
                    }
                    else{
                        zIndex = above - below;
                        if(zIndex < 10) adjustZindexFlag = true;
                        zIndex = Math.round(below + zIndex/2);
                    }
                }

                layerPackages[id].infoEinheit.layerStackPosition = targetLevel;
                layerPackages[id].zIndexBase = zIndex;

                for(x in layerPackages[id].baseLayer){
                    layerPackages[id].baseLayer[x].zIndex = zIndex;
                }
                for(x in layerPackages[id].overlayLayer){
                    layerPackages[id].overlayLayer[x].zIndex = zIndex + 1;
                }
                layerPackages[id].featureLayer.zIndex = zIndex + 2;


                setZindexPackage(layerPackages[id],type);


                if(adjustZindexFlag) adjustZindex();
            },
			/**
			 * remove feature from layer
			 * @name  Service:mapEditFeature#removeFeature
			 * @function
			 * @param feature {object} openlayers feature object
			 * @param layer {object} openlayers layer object
			 */
            removeFeature : function(feature,layer){
                layer.removeFeatures([feature.geom]);
            },
			/**
			 * remove all features from a layer
			 * @name  Service:mapEditFeature#removeAllFeatures
			 * @function
			 * @param layer {object} openlayers layer object
			 */
            removeAllFeatures : function(layer){
                layer.removeAllFeatures();

            },
			/**
			 * get the mapview
			 * @name  Service:mapEditFeature#getMapView
			 * @function
			 * @returns {object} {wkt: geom as wkt sring, zoom: integer}
			 */
            getMapView : function(){
                var zoom = OLmap.getZoom();
                var center = OLmap.getCenter();
                var wkt = util.featureToWKT(new OpenLayers.Feature.Vector(new OpenLayers.Geometry.Point(center.lon,center.lat)));

                return {zoom:zoom, wkt:wkt}
            },
			/**
			 * set mapview
			 * @name  Service:mapEditFeature#setMapView
			 * @function
			 * @param mapView {object} {wkt: geom as wkt sring, zoom: integer}
			 */
            setMapView : function(mapView){
                var center = util.WKTToFeature(mapView.wkt);
                OLmap.moveTo(new OpenLayers.LonLat(center.geometry.x,center.geometry.y),mapView.zoom);
            }
        };
    });
