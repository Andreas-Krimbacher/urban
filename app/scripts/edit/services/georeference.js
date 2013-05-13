'use strict';

angular.module('udm.edit')
  .factory('georeference', function (OpenLayersMap) {
        var imgLayer = null;
        var imgPoint = null;
        var imgPixelPoint = null;
        var imgPointFeature = null;


        var CPlayer = null;
        var CPId = 0;
        var CP = [];
        var CPControl = null;

        var firstPoint = null;
        var secondPoint = null;

        var resultLayer = null;

        var fixState = false;
        var currentZoom = 999;

        var map = OpenLayersMap.getMap();
        var moveEventCurrentZoom = 999;

        var addMoveEvent = function(){
            map.events.register('movestart', this, function(value){
                imgPixelPoint = map.getViewPortPxFromLonLat(new OpenLayers.LonLat(imgPoint.x,imgPoint.y));
            });

            moveEventCurrentZoom = map.getZoom();
            map.events.register('move', this, function(value){
                if(value.object.zoom == moveEventCurrentZoom){
                    moveEventCurrentZoom = value.object.zoom;
                    var point = map.getLonLatFromViewPortPx(imgPixelPoint);
                    imgPoint.x = point.lon;
                    imgPoint.y = point.lat;
                    imgLayer.redraw();
                }
                moveEventCurrentZoom = value.object.zoom;
            });
        }

        var removeMoveEvent = function(){
            map.events.remove('movestart');
            map.events.remove('move');
        }

    // Public API here
    return {
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

                map.addLayers([imgLayer]);

            }
            if(imgLayer.features.length == 0){
                imgPoint = new OpenLayers.Geometry.Point(map.getCenter().lon,map.getCenter().lat);
                imgPoint.setBounds(map.getMaxExtent());
                imgPointFeature = new OpenLayers.Feature.Vector(imgPoint);

                imgPointFeature.attributes = img;
                imgPointFeature.attributes.rot = -imgPointFeature.attributes.rot;

                imgLayer.addFeatures([imgPointFeature]);
            }

            imgPoint.x = map.getCenter().lon;
            imgPoint.y = map.getCenter().lat;

            imgPointFeature.attributes = img;
            imgPointFeature.attributes.rot = -imgPointFeature.attributes.rot;

            imgLayer.redraw();


            addMoveEvent();

            var previousZoom = map.getZoom();
            map.events.register('zoomend', this, function(value){
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
	fetchMap: function(){
            map = OpenLayersMap.getMap();
        },
        centerImg: function(){
            if(imgPoint){
                imgPoint.x = map.getCenter().lon;
                imgPoint.y = map.getCenter().lat;
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
                map.events.remove('move');
                fixState = true;
            }
            else if(!state && fixState){
                addMoveEvent();
                fixState = false;
            }


        },
        createCP: function(img,callback,digest){

            if(!CPlayer){

                var styleMap = new OpenLayers.StyleMap({
                    'default': {

                    },
                    'select': {
                        graphicName: '${graphic}',
                        pointRadius: '${size}',
                        strokeColor: '#FF231A',
                        strokeWidth: 2,
                        fillColor: 'lime'
                    },
                    temporary: {
                        graphicName: 'cross',
                        pointRadius: 8,
                        strokeColor: '#FF0000',
                        strokeWidth: 2,
                        fillColor: '#000000'
                    }

                });

                var lookup = {
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
                }

                styleMap.addUniqueValueRules("default", "type", lookup);

                CPlayer = new OpenLayers.Layer.Vector('CP', {
                    styleMap: styleMap
                });

                CPControl = new OpenLayers.Control.DrawFeature(CPlayer,OpenLayers.Handler.Point);

                map.addControl(CPControl);
                map.addLayers([CPlayer]);
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

                var line = -map.getPixelFromLonLat(new OpenLayers.LonLat(imgPoint.x,imgPoint.y)).y + map.getPixelFromLonLat(new OpenLayers.LonLat(pixelPoint.x,pixelPoint.y)).y + img.height/2;
                var pixel = -map.getPixelFromLonLat(new OpenLayers.LonLat(imgPoint.x,imgPoint.y)).x + map.getPixelFromLonLat(new OpenLayers.LonLat(pixelPoint.x,pixelPoint.y)).x + img.width/2;

                line = img.realHeight * line / img.height;
                pixel = img.realWidth * pixel / img.width;


                line = Math.round(line);
                pixel = Math.round(pixel);

                if(line < 0 || pixel < 0 || line > img.realHeight || pixel > img.realWidth){
                    alert('outside');
                    CPlayer.removeFeatures(firstPoint);
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
            for(var x in CP){
                if(CP[x].id == id){
                    CPlayer.removeFeatures([CP[x].imgPoint,CP[x].worldPoint,CP[x].line])
                }
            }
        },
        clearCP: function(id){
            if(CPControl) CPControl.deactivate();
            if(CPlayer) CPlayer.removeAllFeatures();
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
            if(CPlayer) map.removeLayer(CPlayer);
            CPlayer = null;
            if(imgLayer) map.removeLayer(imgLayer);
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
            map.addLayer(resultLayer);

            if(map.getZoom() > metaData.TileSet.maxZoom){
                map.zoomTo(metaData.TileSet.maxZoom);
            }
        },
        destroyResultLayer: function(metaData){
            if(resultLayer)  map.removeLayer(resultLayer);
            resultLayer = null;
        },
        setOpacityResult: function(value){
            resultLayer.setOpacity(value);
        },
        clearAllLayers : function(){
            if(resultLayer)  map.removeLayer(resultLayer);
            resultLayer = null;
            if(CPlayer) map.removeLayer(CPlayer);
            CPlayer = null;
            if(imgLayer) map.removeLayer(imgLayer);
            imgLayer = null;

            map.events.remove('movestart');
            map.events.remove('move');
            map.events.remove('zoomend');
        }

    };
  });
