'use strict';

angular.module('udm.map')
    .factory('mapGeoreference', function (OpenLayersMap) {
        var imgLayer = null;
        var imgPoint = null;
        var imgPixelPoint = null;
        var imgPointFeature = null;


        var CPlayer = null;
        var CPId = 0;
        var CP = [];
        var CPControl = null;
        var SelectControl = null;

        var firstPoint = null;
        var secondPoint = null;

        var resultLayer = null;

        var fixState = false;
        var currentZoom = 999;

        var OLmap = OpenLayersMap.getMap();
        var moveEventCurrentZoom = 999;


        var styleMap = new OpenLayers.StyleMap({
            'default': {},
            'select': {},
            temporary: {
                graphicName: 'cross',
                pointRadius: 8,
                strokeColor: '#FF0000',
                strokeWidth: 2,
                fillColor: '#000000'
            }

        });

        var lookupDefault = {
            "first": {
                graphicName: 'cross',
                pointRadius: '8',
                fillColor: '#0000FF'
            },
            "firstSmall": {
                graphicName: 'circle',
                pointRadius: '3',
                fillColor: '#0000FF'
            },
            "second": {
                graphicName: 'cross',
                pointRadius: '8',
                fillColor: '#00FF00'
            },
            "line": {
                fillColor: '#000000'
            }
        };

        styleMap.addUniqueValueRules("default", "type", lookupDefault);

        var lookupSelect = {
            "first": {
                graphicName: 'cross',
                pointRadius: '8',
                fillColor: '#0000FF',
                strokeColor: '#FF0000',
                strokeWidth: 2
            },
            "second": {
                graphicName: 'cross',
                pointRadius: '8',
                fillColor: '#00FF00',
                strokeColor: '#FF0000',
                strokeWidth: 2
            },
            "line": {
                fillColor: '#FF0000',
                strokeColor: '#FF0000'
            }
        };

        styleMap.addUniqueValueRules("select", "type", lookupSelect);

        var addMoveEvent = function(){
            OLmap.events.register('movestart', this, function(){
                imgPixelPoint = OLmap.getViewPortPxFromLonLat(new OpenLayers.LonLat(imgPoint.x,imgPoint.y));
            });

            moveEventCurrentZoom = OLmap.getZoom();
            OLmap.events.register('move', this, function(value){
                if(value.object.zoom == moveEventCurrentZoom){
                    var point = OLmap.getLonLatFromViewPortPx(imgPixelPoint);
                    imgPoint.x = point.lon;
                    imgPoint.y = point.lat;
                    imgLayer.redraw();
                }
                moveEventCurrentZoom = value.object.zoom;
            });
        };

        var removeMoveEvent = function(){
            OLmap.events.remove('movestart');
            OLmap.events.remove('move');
        };

        // Public API here
        return {
            clearAllLayers : function(){
                resultLayer = null;
                CPlayer = null;
                imgLayer = null;
            },
            showImageOverlay: function(img,digest){

                if(!imgLayer){
                    var styleMap = new OpenLayers.Style({
                        externalStaticGraphic: "${path}",
                        externalGraphic:true,
                        graphicWidth: "${width}",
                        graphicHeight: "${height}",
                        rotation:"${rot}",
                        graphicOpacity:"${opacity}"
                    });
                    imgLayer = new OpenLayers.Layer.Vector("My Image Overlay", {
                        styleMap: styleMap
                    });

                    OLmap.addLayers([imgLayer]);

                }
                if(imgLayer.features.length == 0){
                    imgPoint = new OpenLayers.Geometry.Point(OLmap.getCenter().lon,OLmap.getCenter().lat);
                    imgPoint.setBounds(OLmap.getMaxExtent());
                    imgPointFeature = new OpenLayers.Feature.Vector(imgPoint);

                    imgPointFeature.attributes = img;
                    imgPointFeature.attributes.rot = -imgPointFeature.attributes.rot;

                    imgLayer.addFeatures([imgPointFeature]);
                }

                imgPoint.x = OLmap.getCenter().lon;
                imgPoint.y = OLmap.getCenter().lat;

                imgPointFeature.attributes = img;
                imgPointFeature.attributes.rot = -imgPointFeature.attributes.rot;

                imgLayer.redraw();


                addMoveEvent();

                var previousZoom = OLmap.getZoom();
                OLmap.events.register('zoomend', this, function(value){
                    if(value.object.zoom != currentZoom){
                        currentZoom = value.object.zoom;
                        var scale = value.object.zoom - previousZoom;
                        if(scale != 0){
                            if(scale < 0) scale = 1/(-scale+1);
                            else scale = scale + 1;
                            imgPointFeature.attributes.width = imgPointFeature.attributes.width * scale;
                            imgPointFeature.attributes.height = imgPointFeature.attributes.height * scale;
                            imgPointFeature.attributes.scale = imgPointFeature.attributes.scale * scale;
                            previousZoom = value.object.zoom;
                            imgLayer.redraw();
                            if(digest) digest();
                        }
                    }
                });

            },
            redrawImageOverlay: function(){
                if(imgLayer) imgLayer.redraw();
            },
            centerImg: function(){
                if(imgPoint){
                    imgPoint.x = OLmap.getCenter().lon;
                    imgPoint.y = OLmap.getCenter().lat;
                    if(imgLayer) imgLayer.redraw();
                }
            },
            clearImgOverlay: function(){
                if(imgPointFeature) imgPointFeature.destroy();
                if(imgLayer) imgLayer.redraw();

            },
            imgFix: function(state){
                if(state && !fixState){
                    removeMoveEvent();
                    OLmap.events.remove('move');
                    fixState = true;
                }
                else if(!state && fixState){
                    addMoveEvent();
                    fixState = false;
                }


            },
            createCP: function(img,callback,digest){

                if(!CPlayer){

                    CPlayer = new OpenLayers.Layer.Vector('CP', {
                        styleMap: styleMap
                    });

                    CPControl = new OpenLayers.Control.DrawFeature(CPlayer,OpenLayers.Handler.Point);
                    SelectControl = new OpenLayers.Control.SelectFeature(CPlayer);

                    OLmap.addControl(CPControl);
                    OLmap.addControl(SelectControl);
                    OLmap.addLayers([CPlayer]);
                }

                CPControl.activate();

                firstPoint = null;
                secondPoint = null;

                CPlayer.events.register('beforefeatureadded', this, function(feature){
                    if(!firstPoint){
                        firstPoint = feature.feature;
                        firstPoint.attributes.type = 'firstSmall';
                        imgPointFeature.attributes.opacity = 0.4;
                        imgLayer.redraw();
                        if(digest) digest();
                        return true;
                    }
                    else{
                        secondPoint = feature.feature;
                        secondPoint.attributes.type = 'second';
                        firstPoint.attributes.type = 'first';
                        imgPointFeature.attributes.opacity = 0.8;
                        imgLayer.redraw();
                        if(digest) digest();
                        return calculateCP();
                    }
                });



                function calculateCP(){

                    CPlayer.events.remove('beforefeatureadded');
                    CPControl.deactivate();



                    var pixelPoint = firstPoint.geometry.clone();
                    pixelPoint.rotate(img.rot,imgPoint);

                    var line = -OLmap.getPixelFromLonLat(new OpenLayers.LonLat(imgPoint.x,imgPoint.y)).y + OLmap.getPixelFromLonLat(new OpenLayers.LonLat(pixelPoint.x,pixelPoint.y)).y + img.height/2;
                    var pixel = -OLmap.getPixelFromLonLat(new OpenLayers.LonLat(imgPoint.x,imgPoint.y)).x + OLmap.getPixelFromLonLat(new OpenLayers.LonLat(pixelPoint.x,pixelPoint.y)).x + img.width/2;

                    line = img.realHeight * line / img.height;
                    pixel = img.realWidth * pixel / img.width;


                    line = Math.round(line);
                    pixel = Math.round(pixel);

                    if(line < 0 || pixel < 0 || line > img.realHeight || pixel > img.realWidth){
                        alert('outside');
                        CPlayer.removeFeatures(firstPoint);
                        callback(null);
                        return false;
                    }


                    var CPline = new OpenLayers.Feature.Vector(new OpenLayers.Geometry.LineString([firstPoint.geometry,secondPoint.geometry]));
                    CPline.attributes.type = 'line';
                    CPlayer.addFeatures(CPline);
                    CPlayer.redraw();

                    var worldPoint = secondPoint.geometry.clone();

                    var point = {id:CPId,imgPoint:{line:line,pixel:pixel},worldPoint:{lon:worldPoint.x,lat:worldPoint.y}};
                    CP.push({id:CPId,imgPoint:firstPoint,worldPoint:secondPoint,line:CPline});

                    CPId++;

                    callback(point);

                    return true;
                }

            },
            cancelCP: function(){
                CPlayer.events.remove('beforefeatureadded');
                if(CPControl) CPControl.deactivate();
                if(firstPoint){
                    CPlayer.removeFeatures(firstPoint);
                    firstPoint = null;
                }
            },
            removeCP: function(id){
                for(var x = 0; x < CP.length; x++){
                    if(CP[x].id == id){
                        CPlayer.removeFeatures([CP[x].imgPoint,CP[x].worldPoint,CP[x].line])
                    }
                }
            },
            clearCP: function(){
                if(CPControl) CPControl.deactivate();
                if(CPlayer) CPlayer.removeAllFeatures();
            },
            highlightCP: function(id){
                for(var x = 0; x < CP.length; x++){
                    if(CP[x].id == id){
                        SelectControl.select(CP[x].imgPoint);
                        SelectControl.select(CP[x].worldPoint);
                        SelectControl.select(CP[x].line);
                    }
                }
            },
            unhighlightCP: function(id){
                for(var x = 0; x < CP.length; x++){
                    if(CP[x].id == id){
                        SelectControl.unselect(CP[x].imgPoint);
                        SelectControl.unselect(CP[x].worldPoint);
                        SelectControl.unselect(CP[x].line);
                    }
                }
            },
            hideEditLayers: function(){
                if(CPlayer) CPlayer.setVisibility(false);
                if(imgLayer) imgLayer.setVisibility(false);
            },
            showEditLayers: function(){
                if(CPlayer) CPlayer.setVisibility(true);
                if(imgLayer) imgLayer.setVisibility(true);
            },
            destroyEditLayers: function(){
                if(CPlayer) OLmap.removeLayer(CPlayer);
                CPlayer = null;
                if(imgLayer) OLmap.removeLayer(imgLayer);
                imgLayer = null;
            },
            showResultLayer: function(metaData){
                var bounds = new OpenLayers.Bounds(metaData.BoundingBox.miny,
                    metaData.BoundingBox.minx,
                    metaData.BoundingBox.maxy,
                    metaData.BoundingBox.maxx).transform(new OpenLayers.Projection("EPSG:4326"),new OpenLayers.Projection("EPSG:900913"));

                resultLayer = new OpenLayers.Layer.TileStream( "Tiles",
                    "http://localhost:8888/", {layername: 'tmp_' + metaData.tileDB,
                        minResolution:metaData.TileSet.minRes,
                        maxResolution:metaData.TileSet.maxRes,
                        maxExtent:bounds,
                        type:'png',
                        isBaseLayer:false,
                        serviceVersion:'v2',
                        transitionEffect:'resize',
                        buffer:3});
                OLmap.addLayer(resultLayer);

                if(OLmap.getZoom() > metaData.TileSet.maxZoom){
                    OLmap.zoomTo(metaData.TileSet.maxZoom);
                }
            },
            destroyResultLayer: function(){
                if(resultLayer)  OLmap.removeLayer(resultLayer);
                resultLayer = null;
            },
            setOpacityResult: function(value){
                resultLayer.setOpacity(value);
            }

        };
    });
