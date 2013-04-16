'use strict';

angular.module('udm.georeference')
  .factory('georeference', function (map) {
        var imgLayer = null;
        var imgPoint = null;
        var imgPointFeature = null;


        var CPlayer = null;
        var CPId = 0;
        var CP = [];
        var CPControl = null;

        var map = map.getMap();

    // Public API here
    return {
        showImageOverlay: function(img){

            if(!imgLayer){
                var styleMap = new OpenLayers.Style({
                    externalGraphic: "${text}",
                    graphicWidth: "${width}",
                    graphicHeight: "${height}",
                    rotation:"${rot}",
                    graphicOpacity:"${opacity}"
                });
                imgLayer = new OpenLayers.Layer.Vector("My Image Overlay", {
                    styleMap: styleMap
                });

                map.addLayers([imgLayer]);

                imgPoint = new OpenLayers.Geometry.Point(map.getCenter().lon,map.getCenter().lat);
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

            map.events.register('move', this, function(){
                imgPoint.x = map.getCenter().lon;
                imgPoint.y = map.getCenter().lat;
                imgLayer.redraw();
            });

        },
        redrawImageOverlay: function(img){
            imgPointFeature.attributes = img;
            imgPointFeature.attributes.rot = -imgPointFeature.attributes.rot;
            imgLayer.redraw();

        },
        fixImg: function(){

            map.events.remove('move');

        },
        freeImg: function(){

            map.events.register('move', this, function(){
                imgPoint.x = map.getCenter().lon;
                imgPoint.y = map.getCenter().lat;
                imgLayer.redraw();
            });

        },
        createCP: function(img,callback){

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

            var firstPoint = null;
            var secondPoint = null;

            CPlayer.events.register('beforefeatureadded', this, function(feature){
                if(!firstPoint){
                    firstPoint = feature.feature;
                    firstPoint.attributes.type = 'firstSmall';
                }
                else{
                    secondPoint = feature.feature;
                    secondPoint.attributes.type = 'second';
                    firstPoint.attributes.type = 'first';
                    calculateCP();
                }
            });



            function calculateCP(){

                CPlayer.events.remove('beforefeatureadded');

                var line = new OpenLayers.Feature.Vector(new OpenLayers.Geometry.LineString([firstPoint.geometry,secondPoint.geometry]));
                line.attributes.type = 'line';
                CPlayer.addFeatures(line);

                CPlayer.redraw();

                CPControl.deactivate();

                CP.push({id:CPId,imgPoint:firstPoint,worldPoint:secondPoint,line:line});

                var pixelPoint = firstPoint.geometry.clone();
                pixelPoint.rotate(img.rot,imgPoint);

                var line = -map.getPixelFromLonLat(new OpenLayers.LonLat(imgPoint.x,imgPoint.y)).y + map.getPixelFromLonLat(new OpenLayers.LonLat(pixelPoint.x,pixelPoint.y)).y + img.height/2;
                var pixel = -map.getPixelFromLonLat(new OpenLayers.LonLat(imgPoint.x,imgPoint.y)).x + map.getPixelFromLonLat(new OpenLayers.LonLat(pixelPoint.x,pixelPoint.y)).x + img.width/2;

                line = img.realHeight * line / img.height;
                pixel = img.realWidth * pixel / img.width;


                line = Math.round(line);
                pixel = Math.round(pixel);


                var point = {id:CPId,imgPoint:{line:line,pixel:pixel},worldPoint:{lon:secondPoint.geometry.x,lat:secondPoint.geometry.y}};
                CPId++;

                callback(point);
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
        }


    };
  });
