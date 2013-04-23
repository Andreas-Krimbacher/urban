'use strict';

angular.module('udm.infoElement')
    .controller('InfoElementCtrl', function ($scope,map) {


        $scope.panelVisibility = {info : false,
            layerlist : false,
            imgslider : false};




//        var layer = new OpenLayers.Layer.Vector("Editable Features", {
//            strategies: [new OpenLayers.Strategy.BBOX()],
//            projection: new OpenLayers.Projection("EPSG:4326"),
//            protocol: new OpenLayers.Protocol.WFS({
//                version: "1.1.0",
//                srsName: "EPSG:4326",
//                url: "http://localhost:9000/geoserver/swa/wfs",
//                featureNS :  "swa",
//                featureType: "features"
//            })
//        });
        $scope.sliderValue = 100;
        var bounds = new OpenLayers.Bounds(252933,6245001,268870,6255644);


        var wms = new OpenLayers.Layer.TileStream( "Tiles",
            "http://localhost:8888/",
            {maxExtent:bounds,layername: 'haussmanngood', type:'png',isBaseLayer:false,serviceVersion:'v2',transitionEffect:'resize',buffer:3} );
        wms.opacity = 0;
        var tween = new OpenLayers.Tween(OpenLayers.Easing.Quad.easeOut);
        wms.events.register('loadend',this, function(value){
            wms.events.remove('loadend');
            var callbacks =  {
                eachStep: function(value) {
                    wms.setOpacity(value.opacity/100);
                }
            }
            tween.start({opacity:0}, {opacity:200}, 150, {callbacks: callbacks});
        });


        $scope.$on('showInfoElement', function(e,infoElement) {




            var styleMap = new OpenLayers.StyleMap({
                "default": new OpenLayers.Style({
                    strokeColor: "#58A0DC",
                    strokeOpacity: .7,
                    strokeWidth: 8,
                    pointRadius: 6,
                    fillColor: "#58A0DC",
                    fillOpacity: 0,
                    cursor: "pointer"
                }),
                "temporary": new OpenLayers.Style({
                    strokeColor: "#E16E0F",
                    strokeOpacity: .9,
                    strokeWidth: 8,
                    fillColor: "#E16E0F",
                    fillOpacity: .3,
                    pointRadius: 6,
                    cursor: "pointer"
                }),
                "select": new OpenLayers.Style({
                    strokeColor: "#E16E0F",
                    strokeOpacity: .7,
                    strokeWidth: 8,
                    fillColor: "#E16E0F",
                    fillOpacity: 0,
                    pointRadius: 6,
                    cursor: "pointer"
                })
            });


            var vectorLayer = new OpenLayers.Layer.Vector("Overlay",{
                styleMap: styleMap
            });

            var point1 = new OpenLayers.LonLat(2.327728,48.865788).transform(new OpenLayers.Projection("EPSG:4326"),new OpenLayers.Projection("EPSG:900913"));
            var point2 = new OpenLayers.LonLat(2.344851,48.860932).transform(new OpenLayers.Projection("EPSG:4326"),new OpenLayers.Projection("EPSG:900913"));
            var point3 = new OpenLayers.LonLat(2.343993,48.86).transform(new OpenLayers.Projection("EPSG:4326"),new OpenLayers.Projection("EPSG:900913"));
            var point4 = new OpenLayers.LonLat(2.375064,48.853223).transform(new OpenLayers.Projection("EPSG:4326"),new OpenLayers.Projection("EPSG:900913"));

            var feature = new OpenLayers.Feature.Vector(new OpenLayers.Geometry.LineString([
                new OpenLayers.Geometry.Point(point1.lon,point1.lat ),
                new OpenLayers.Geometry.Point(point2.lon,point2.lat ),
                new OpenLayers.Geometry.Point(point3.lon,point3.lat ),
                new OpenLayers.Geometry.Point(point4.lon,point4.lat )]));
            vectorLayer.addFeatures(feature);


            var point = new OpenLayers.LonLat(2.339476,48.869434).transform(new OpenLayers.Projection("EPSG:4326"),new OpenLayers.Projection("EPSG:900913"));
            feature = new OpenLayers.Feature.Vector(
                new OpenLayers.Geometry.Point(point.lon,point.lat ));
            vectorLayer.addFeatures(feature);



            map.addLayers([wms,vectorLayer]);






            var hoverControl = new OpenLayers.Control.SelectFeature(vectorLayer,{hover: true,
                highlightOnly: true,
                renderIntent: "temporary"
            });
            map.getMap().addControl(hoverControl);
            hoverControl.activate();

            var selectControl = new OpenLayers.Control.SelectFeature(vectorLayer,{
                onSelect:function(e){
                    if(e.geometry.CLASS_NAME == "OpenLayers.Geometry.Point"){
                        $scope.setVisibilityImgSlider(true);
                    }
                    if(e.geometry.CLASS_NAME == "OpenLayers.Geometry.LineString"){

                        var infoElement = {name: 'Rui de Rivoli',
                            info: 'Die Straße wurde mit durchlaufenden Arkaden nach dem baukünstlerischen Vorbild der Place des Vosges auf ausdrückliche Anweisung Napoléon Bonapartes angelegt, welcher damals Erster Konsul der Französischen Republik war und im Rahmen seiner bahnbrechenden innenpolitischen Reformen den zukunftsweisenden Plan fasste, durch großangelegte städtebauliche Projekte die Stadt Paris nicht nur grundlegend zu modernisieren, sondern auch umfassend zu verschönern. Der Beschluss zum Bau dieser Straße wurde am 9. Oktober 1801 gefasst. Sie wurde nach dem italienischen Ort Rivoli bei Verona benannt, in dessen Nähe die von Napoleon geführte französische Revolutionsarmee im Januar 1797 in der Schlacht von Rivoli die Österreicher entscheidend besiegt hatte.',
                            start : '1793',
                            end : '1800'
                        }


                        $scope.$apply($scope.$broadcast('showInfo',infoElement));
                    }
                }});
            map.getMap().addControl(selectControl);
            selectControl.activate();


            $scope.$broadcast('showLayerInList',infoElement);
            $scope.$broadcast('showInfo',infoElement);
            $scope.panelVisibility.info = true;
            $scope.panelVisibility.layerlist = true;

        });


        $scope.$on('sliderChanged', function(e,value) {
            wms.setOpacity(value.value/100);
        });

        $scope.setVisibilityImgSlider = function(state){
            $scope.panelVisibility.imgslider = state;
        };




    });
