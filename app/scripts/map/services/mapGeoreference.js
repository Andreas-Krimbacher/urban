'use strict';
/**
 * Service for georeferncing functions
 * @name Service:mapGeoreference
 * @namespace
 * @author Andreas Krimbacher
 */
angular.module('udm.map')
    .factory('mapGeoreference', function (OpenLayersMap) {
        /**
         * image layer
         * @name Service:mapGeoreference#imgLayer
         * @private
         * @type {object}
         */
        var imgLayer = null;
        /**
         * image point in map coordinates
         * @name Service:mapGeoreference#imgPoint
         * @private
         * @type {object}
         */
        var imgPoint = null;
        /**
         * image point in pixel coordinates
         * @name Service:mapGeoreference#imgPixelPoint
         * @private
         * @type {object}
         */
        var imgPixelPoint = null;
        /**
         * openlayers point feature for the image
         * @name Service:mapGeoreference#imgPointFeature
         * @private
         * @type {object}
         */
        var imgPointFeature = null;


        /**
         * refernce points layer
         * @name Service:mapGeoreference#CPlayer
         * @private
         * @type {object}
         */
        var CPlayer = null;
        /**
         * count for the id of the reference points
         * @name Service:mapGeoreference#CPId
         * @private
         * @type {integer}
         */
        var CPId = 0;
        /**
         * reference points
         * @name Service:mapGeoreference#CP
         * @private
         * @type {Array(object)}
         */
        var CP = [];
        /**
         * control for adding reference points
         * @name Service:mapGeoreference#CPControl
         * @private
         * @type {object}
         */
        var CPControl = null;
        /**
         * control fopr highlighting reference points
         * @name Service:mapGeoreference#SelectControl
         * @private
         * @type {object}
         */
        var SelectControl = null;

        /**
         * first point during the add refernce point process (image point)
         * @name Service:mapGeoreference#firstPoint
         * @private
         * @type {object}
         */
        var firstPoint = null;
        /**
         * second point during the add refernce point process (map point)
         * @name Service:mapGeoreference#secondPoint
         * @private
         * @type {object}
         */
        var secondPoint = null;

        /**
         * layer to show the result of the georeferncing
         * @name Service:mapGeoreference#resultLayer
         * @private
         * @type {object}
         */
        var resultLayer = null;

        /**
         * image fixed flag
         * @name Service:mapGeoreference#fixState
         * @private
         * @type {boolean}
         */
        var fixState = false;
        /**
         * current zoom level
         * @name Service:mapGeoreference#currentZoom
         * @private
         * @type {integer}
         */
        var currentZoom = 999;
        /**
         * current zoom level for the map move event
         * @name Service:mapGeoreference#moveEventCurrentZoom
         * @private
         * @type {integer}
         */
        var moveEventCurrentZoom = 999;

        /**
         * openlayers map object
         * @name Service:mapGeoreference#currentZoom
         * @private
         * @type {object}
         */
        var OLmap = OpenLayersMap.getMap();

        /**
         * style map for the CPlayer
         * @name Service:mapGeoreference#styleMap
         * @private
         * @type {object}
         */
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

        /**
         * add a map move event to keep the image in the center of the map
         * @name  Service:mapGeoreference#addMoveEvent
         * @function
         * @private
         */
        var addMoveEvent = function(){
            OLmap.events.register('movestart', this, function(){
                imgPixelPoint = OLmap.getLayerPxFromViewPortPx(OLmap.getViewPortPxFromLonLat(new OpenLayers.LonLat(imgPoint.x,imgPoint.y)));
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


        /**
         * remove the move event
         * @name  Service:mapGeoreference#removeMoveEvent
         * @function
         * @private
         */
        var removeMoveEvent = function(){
            OLmap.events.remove('movestart');
            OLmap.events.remove('move');
        };

        // Public API here
        return {
            /**
             * set all layer variables to null
             * @name  Service:mapGeoreference#clearAllLayers
             * @function
             */
            clearAllLayers : function(){
                resultLayer = null;
                CPlayer = null;
                imgLayer = null;
            },
            /**
             * show image in the map
             * @name  Service:mapGeoreference#showImageOverlay
             * @function
             * @param img {object} image object e.g {id:1,text:'img1', path : 'img1.png',width:1000,height:500, scale : 1,realWidth:1400,realHeight:1400, rot:0,opacity:1}
             * @param digest {function} callback
             */
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
            /**
             * redraw the image layer
             * @name  Service:mapGeoreference#redrawImageOverlay
             * @function
             */
            redrawImageOverlay: function(){
                if(imgLayer) imgLayer.redraw();
            },
            /**
             * center the image in the map
             * @name  Service:mapGeoreference#centerImg
             * @function
             */
            centerImg: function(){
                if(imgPoint){
                    imgPoint.x = OLmap.getCenter().lon;
                    imgPoint.y = OLmap.getCenter().lat;
                    if(imgLayer) imgLayer.redraw();
                }
            },
            /**
             * remove image
             * @name  Service:mapGeoreference#clearImgOverlay
             * @function
             */
            clearImgOverlay: function(){
                if(imgPointFeature) imgPointFeature.destroy();
                if(imgLayer) imgLayer.redraw();

            },
            /**
             * set the image fix (true/false)
             * @name  Service:mapGeoreference#imgFix
             * @function
             * @param state {boolean} state
             */
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
            /**
             * start the add reference point process
             * @name  Service:mapGeoreference#createCP
             * @function
             * @param img {object} image object
             * @param callback {function} callback(reference point), called after the reference point pair is calculated
             * @param digest {function} callback, called after the first point is added and after the secound point is added
             */
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
            /**
             * cancel the add reference point process
             * @name  Service:mapGeoreference#cancelCP
             * @function
             */
            cancelCP: function(){
                CPlayer.events.remove('beforefeatureadded');
                if(CPControl) CPControl.deactivate();
                if(firstPoint){
                    CPlayer.removeFeatures(firstPoint);
                    firstPoint = null;
                }
            },
            /**
             * remove one reference point
             * @name  Service:mapGeoreference#cancelCP
             * @function
             * @param id {integer} Id reference point
             */
            removeCP: function(id){
                for(var x = 0; x < CP.length; x++){
                    if(CP[x].id == id){
                        CPlayer.removeFeatures([CP[x].imgPoint,CP[x].worldPoint,CP[x].line])
                    }
                }
            },
            /**
             * remove all reference points
             * @name  Service:mapGeoreference#clearCP
             * @function
             */
            clearCP: function(){
                if(CPControl) CPControl.deactivate();
                if(CPlayer) CPlayer.removeAllFeatures();
            },
            /**
             * highlight reference point in map
             * @name  Service:mapGeoreference#highlightCP
             * @function
             * @param id {integer} Id reference point
             */
            highlightCP: function(id){
                for(var x = 0; x < CP.length; x++){
                    if(CP[x].id == id){
                        SelectControl.select(CP[x].imgPoint);
                        SelectControl.select(CP[x].worldPoint);
                        SelectControl.select(CP[x].line);
                    }
                }
            },
            /**
             * unhighlight reference point in map
             * @name  Service:mapGeoreference#unhighlightCP
             * @function
             * @param id {integer} Id reference point
             */
            unhighlightCP: function(id){
                for(var x = 0; x < CP.length; x++){
                    if(CP[x].id == id){
                        SelectControl.unselect(CP[x].imgPoint);
                        SelectControl.unselect(CP[x].worldPoint);
                        SelectControl.unselect(CP[x].line);
                    }
                }
            },
            /**
             * hide CPlayer and imgLayer
             * @name  Service:mapGeoreference#hideEditLayers
             * @function
             */
            hideEditLayers: function(){
                if(CPlayer) CPlayer.setVisibility(false);
                if(imgLayer) imgLayer.setVisibility(false);
            },
            /**
             * show CPlayer and imgLayer
             * @name  Service:mapGeoreference#showEditLayers
             * @function
             */
            showEditLayers: function(){
                if(CPlayer) CPlayer.setVisibility(true);
                if(imgLayer) imgLayer.setVisibility(true);
            },
            /**
             * destroy CPlayer and imgLayer
             * @name  Service:mapGeoreference#destroyEditLayers
             * @function
             */
            destroyEditLayers: function(){
                if(CPlayer) OLmap.removeLayer(CPlayer);
                CPlayer = null;
                if(imgLayer) OLmap.removeLayer(imgLayer);
                imgLayer = null;
            },
            /**
             * show the georeferncing result
             * @name  Service:mapGeoreference#showResultLayer
             * @function
             */
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
            /**
             * delete the resultLayer
             * @name  Service:mapGeoreference#destroyResultLayer
             * @function
             */
            destroyResultLayer: function(){
                if(resultLayer)  OLmap.removeLayer(resultLayer);
                resultLayer = null;
            },
            /**
             * set the opacity of the resultLayer
             * @name  Service:mapGeoreference#setOpacityResult
             * @function
             * @param value {float} opacity
             */
            setOpacityResult: function(value){
                resultLayer.setOpacity(value);
            }

        };
    });
