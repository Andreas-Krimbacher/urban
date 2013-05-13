'use strict';

angular.module('udm.openWorld')
    .factory('layers', function (OpenLayersMap) {

        var layerPackages = {};

        var nextZindexTop = 1000;

        var OLmap = OpenLayersMap.getMap();

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
                strokeColor: '${color}',
                strokeOpacity: 1,
                strokeWidth: 8,
                fillColor: '${color}',
                fillOpacity: 0.7,
                pointRadius: 6,
                cursor: "pointer",
                graphicZIndex: '${zIndex}'
            }),
            "select": new OpenLayers.Style({
                strokeColor: '${color}',
                strokeOpacity: 1,
                strokeWidth: 8,
                fillColor: '${color}',
                fillOpacity: 0.7,
                pointRadius: 6,
                cursor: "pointer",
                graphicZIndex: '${zIndex}'
            })
        });


        var calculateZindex = function(layerPackage,infoEinheit,position){
            if(position == 'top'){
                var zIndexBase = nextZindexTop;
                nextZindexTop = nextZindexTop + 100;
                if(nextZindexTop > 2000) alert('redrawLayers');
            }

            layerPackage.zIndexBase = zIndexBase;
            for(var x in infoEinheit.features){
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

        };

        var addTileLayer = function(metaData,zIndex){

            var bounds = new OpenLayers.Bounds(metaData.BoundingBox.miny,
                metaData.BoundingBox.minx,
                metaData.BoundingBox.maxy,
                metaData.BoundingBox.maxx).transform(new OpenLayers.Projection("EPSG:4326"),new OpenLayers.Projection("EPSG:900913"));

            var tileLayer = new OpenLayers.Layer.TileStream( metaData.tileDB,
                "http://localhost:8888/", {layername: metaData.tileDB,
                    minResolution:metaData.TileSet.minRes,
                    maxResolution:metaData.TileSet.maxRes,
                    maxExtent:bounds,
                    type:'png',
                    isBaseLayer:false,
                    serviceVersion:'v2',
                    transitionEffect:'resize',
                    buffer:3});

            tileLayer.opacity = 0;

            var tween = new OpenLayers.Tween(OpenLayers.Easing.Quad.easeOut);
            tileLayer.events.register('loadend',this, function(value){
                tileLayer.events.remove('loadend');
                var callbacks =  {
                    eachStep: function(value) {
                        tileLayer.setOpacity(value.opacity/100);
                    }
                };
                tween.start({opacity:0}, {opacity:100}, 50, {callbacks: callbacks});
            });

            tileLayer.setZIndex(zIndex);

            if(!OLmap) OLmap = OpenLayersMap.getMap();
            OLmap.addLayer(tileLayer);

            return tileLayer;
        };

        var removeTileLayer = function(layer){

            var tween = new OpenLayers.Tween(OpenLayers.Easing.Quad.easeOut);

            var callbacks =  {
                eachStep: function(value) {
                    layer.setOpacity(value.opacity/100);
                    if(value.opacity == 0) OLmap.removeLayer(layer);;
                }
            };
            tween.start({opacity:layer.opacity*100}, {opacity:0}, 50*layer.opacity, {callbacks: callbacks});

        };

        var createFeatureLayer = function(zIndex){
            var featureLayer = new OpenLayers.Layer.Vector("Features",{
                styleMap: featureStyle,
                rendererOptions: { zIndexing: true }
            });


            if(!OLmap) OLmap = OpenLayersMap.getMap();

            var hoverControl = new OpenLayers.Control.SelectFeature(featureLayer,{hover: true,
                highlightOnly: true,
                renderIntent: "temporary"
            });
            OLmap.addControl(hoverControl);
            hoverControl.activate();

            var selectControl = new OpenLayers.Control.SelectFeature(featureLayer,{
                onSelect:function(feature){
                    feature.attributes.onSelect(feature);
                },
                onUnselect:function(feature){
                    feature.attributes.onSelect();
                }});
            OLmap.addControl(selectControl);
            selectControl.activate();


            featureLayer.setZIndex(zIndex);

            return featureLayer;
        };

        var addFeatureLayer = function(layer){

            layer.setOpacity(0);
            OLmap.addLayer(layer);

            var tween = new OpenLayers.Tween(OpenLayers.Easing.Quad.easeOut);

            var callbacks =  {
                eachStep: function(value) {
                    layer.setOpacity(value.opacity/100);
                }
            };

            tween.start({opacity:0}, {opacity:100}, 50, {callbacks: callbacks});


        };

        var removeFeatureLayer = function(layer){

            var tween = new OpenLayers.Tween(OpenLayers.Easing.Quad.easeOut);

            var callbacks =  {
                eachStep: function(value) {
                    layer.setOpacity(value.opacity/100);
                    if(value.opacity == 0) OLmap.removeLayer(layer);
                }
            };
            tween.start({opacity:layer.opacity*100}, {opacity:0}, 50*layer.opacity, {callbacks: callbacks});

        };

        var addFeatureToLayer = function(feature,layer){
            layer.addFeatures([feature]);
        };

        var setZindexLayer = function(layer,zIndex,type){

            type = '';

            if(type == 'fadeIn'){
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
            else if(type == 'fadeOut'){

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

        var setZindexPackage = function(layerPackage,type){

            for(var x in layerPackage.baseLayer){
                setZindexLayer(layerPackage.baseLayer[x].layer,layerPackage.baseLayer[x].zIndex,type);
            }
            for(var x in layerPackage.overlayLayer){
                setZindexLayer(layerPackage.overlayLayer[x].layer,layerPackage.overlayLayer[x].zIndex,type);
            }
            if(layerPackage.featureLayer.layer){
                setZindexLayer(layerPackage.featureLayer.layer,layerPackage.featureLayer.zIndex,type);
            }

        };

        // Public API here
        return {
            addInfoEinheit : function(infoEinheit,position){

                var layerPackage = {};
                layerPackage.baseLayer = {};
                layerPackage.overlayLayer = {};
                layerPackage.featureLayer = {};
                layerPackage.infoEinheit = infoEinheit;
                calculateZindex(layerPackage,infoEinheit,position);


                if(position == 'top'){
                    //0 is on top
                    layerPackage.infoEinheit.layerStackPosition = 0;
                    for(var x in layerPackages){
                        layerPackages[x].infoEinheit.layerStackPosition = layerPackages[x].infoEinheit.layerStackPosition + 1;
                    }
                }

                infoEinheit.hasFeatureLayer = false;
                infoEinheit.overlayLayer = {};
                infoEinheit.featureLayer = {};
                infoEinheit.baseLayer = {};

                for(var x in infoEinheit.features){
                    if(infoEinheit.features[x].typ == 'plan'){
                        layerPackage.baseLayer[infoEinheit.features[x].id].layer = addTileLayer(infoEinheit.features[x].feature,layerPackage.baseLayer[infoEinheit.features[x].id].zIndex);

                        infoEinheit.baseLayer.visible = true;
                        infoEinheit.baseLayer.opacity = 1;
                    }
                    else if(infoEinheit.features[x].typ == 'planOverlay'){
                        layerPackage.overlayLayer[infoEinheit.features[x].id].layer = addTileLayer(infoEinheit.features[x].feature,layerPackage.overlayLayer[infoEinheit.features[x].id].zIndex);

                        infoEinheit.overlayLayer[infoEinheit.features[x].id] = {};
                        infoEinheit.overlayLayer[infoEinheit.features[x].id].visible = true;
                        infoEinheit.overlayLayer[infoEinheit.features[x].id].opacity = 1;
                    }
                    else{
                        if(!layerPackage.featureLayer.layer){
                            layerPackage.featureLayer.layer = createFeatureLayer(layerPackage.featureLayer.zIndex);

                            infoEinheit.hasFeatureLayer = true;
                            infoEinheit.featureLayer.visible = true;
                            infoEinheit.featureLayer.opacity = 1;
                        }
                        addFeatureToLayer(infoEinheit.features[x].feature,layerPackage.featureLayer.layer);
                    }
                }

                if(layerPackage.featureLayer.layer) addFeatureLayer(layerPackage.featureLayer.layer);

                layerPackages[infoEinheit.id] = layerPackage;
            },
            removeInfoEinheit : function(id){
                if(layerPackages[id]){
                    for(var x in layerPackages[id].baseLayer){
                        removeTileLayer(layerPackages[id].baseLayer[x].layer);
                    }
                    for(var x in layerPackages[id].overlayLayer){
                        removeTileLayer(layerPackages[id].overlayLayer[x].layer);
                    }
                    if(layerPackages[id].featureLayer.layer) removeFeatureLayer(layerPackages[id].featureLayer.layer);

                    nextZindexTop = 200;
                    for(var x in layerPackages){
                        if((layerPackages[x] != layerPackages[id]) && nextZindexTop < layerPackages[x].zIndexBase)
                            nextZindexTop = layerPackages[x].zIndexBase;
                    }
                    if(nextZindexTop < 900) nextZindexTop = 900;
                    nextZindexTop = nextZindexTop + 100;

                    delete layerPackages[id];
                }
            },
            setOpacity : function(typ,infoEinheitId,featureId,value){
                if(layerPackages[infoEinheitId] && layerPackages[infoEinheitId][typ] && layerPackages[infoEinheitId][typ][featureId])
                    layerPackages[infoEinheitId][typ][featureId].layer.setOpacity(value);
            },
            toogleVisibility : function(typ,infoEinheitId,featureId){
                if(typ == 'featureLayer')
                    if(layerPackages[infoEinheitId] && layerPackages[infoEinheitId].featureLayer.layer){
                        layerPackages[infoEinheitId].featureLayer.layer.setVisibility(!layerPackages[infoEinheitId].featureLayer.layer.getVisibility());
                        layerPackages[infoEinheitId].featureLayer.visible = !layerPackages[infoEinheitId].featureLayer.visible;
                    }
            },
            changeOrder : function(id,targetLevel){

                if(targetLevel == layerPackages[id].infoEinheit.layerStackPosition) return;

                var above = null;
                var below = null;
                var zIndex = null;

                var type = 'fadeIn';
                if(layerPackages[id].infoEinheit.layerStackPosition < targetLevel) type = 'fadeOut';

                if(layerPackages[id].infoEinheit.layerStackPosition < targetLevel){ //to the back
                    for(var x in layerPackages){
                        if(layerPackages[x].infoEinheit.layerStackPosition == targetLevel+1) below = layerPackages[x].zIndexBase;
                        if(layerPackages[x].infoEinheit.layerStackPosition == targetLevel) above = layerPackages[x].zIndexBase;

                        if(layerPackages[x] != layerPackages[id]){
                            if((layerPackages[x].infoEinheit.layerStackPosition > layerPackages[id].infoEinheit.layerStackPosition) && (layerPackages[x].infoEinheit.layerStackPosition <= targetLevel))
                                layerPackages[x].infoEinheit.layerStackPosition--; //readjust layerStackPosition
                        }
                    }
                    if(below == null){
                        zIndex = 2000;
                        for(var x in layerPackages){
                            if(layerPackages[x].zIndexBase < zIndex) zIndex = layerPackages[x].zIndexBase;
                        }
                        zIndex = zIndex - 100;
                        if(zIndex < 300) alert('redrawLayers');
                    }
                    else{
                        zIndex = above - below;
                        if(zIndex < 10) alert('redrawLayers');
                        zIndex = Math.round(below + zIndex/2);
                    }
                }
                if(layerPackages[id].infoEinheit.layerStackPosition > targetLevel){ //to the front
                    for(var x in layerPackages){
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
                        if(nextZindexTop > 2000) alert('redrawLayers');
                    }
                    else{
                        zIndex = above - below;
                        if(zIndex < 10) alert('redrawLayers');
                        zIndex = Math.round(below + zIndex/2);
                    }
                }

                layerPackages[id].infoEinheit.layerStackPosition = targetLevel;
                layerPackages[id].zIndexBase = zIndex;

                for(var x in layerPackages[id].baseLayer){
                    layerPackages[id].baseLayer[x].zIndex = zIndex;
                }
                for(var x in layerPackages[id].overlayLayer){
                    layerPackages[id].overlayLayer[x].zIndex = zIndex + 1;
                }
                layerPackages[id].featureLayer.zIndex = zIndex + 2;


                setZindexPackage(layerPackages[id],type);
            },


            removeTileLayer : function(tileLayer){
                OLmap.removeLayer(tileLayer);
            },
            removeFeature : function(feature,layer){
                layer.removeFeatures([feature.geom]);
            },
            removeAllFeatures : function(layer){
                layer.removeAllFeatures();

            }
        };
    });
