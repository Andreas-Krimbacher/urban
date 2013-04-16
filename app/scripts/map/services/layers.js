'use strict';

angular.module('udm.map')
  .factory('layers', function ($rootScope) {

        var saveStrategyPoint = new OpenLayers.Strategy.Save();
        var saveStrategyLine = new OpenLayers.Strategy.Save();
        var saveStrategyPoly = new OpenLayers.Strategy.Save();

        var wfsPoint = new OpenLayers.Layer.Vector("Editable Features", {
            strategies: [new OpenLayers.Strategy.BBOX(), saveStrategyPoint],
            projection: new OpenLayers.Projection("EPSG:4326"),
            protocol: new OpenLayers.Protocol.WFS({
                version: "1.1.0",
                srsName: "EPSG:4326",
                url: "http://localhost:9000/geoserver/swa/wfs",
                featureNS :  "swa",
                featureType: "features",
                geometryName: "geom_point"
            })
        });

//        wfsPoint.events.register('featureadded',this,function(e){
//            if(!e.feature.attributes.id) e.feature.attributes = settings.getDefaultValues();
//            $rootScope.$broadcast('featureadded', e.feature);
//        });
//
//        var wfsLine = new OpenLayers.Layer.Vector("Editable Features", {
//            strategies: [new OpenLayers.Strategy.BBOX(), saveStrategyLine],
//            projection: new OpenLayers.Projection("EPSG:4326"),
//            protocol: new OpenLayers.Protocol.WFS({
//                version: "1.1.0",
//                srsName: "EPSG:4326",
//                url: "http://localhost:9000/geoserver/swa/wfs",
//                featureNS :  "swa",
//                featureType: "features",
//                geometryName: "geom_line"
//            })
//        });
//
//        wfsLine.events.register('featureadded',this,function(e){
//            if(!e.feature.attributes.id) e.feature.attributes = settings.getDefaultValues();
//            $rootScope.$broadcast('featureadded', e.feature);
//        });
//
//        var wfsPoly = new OpenLayers.Layer.Vector("Editable Features", {
//            strategies: [new OpenLayers.Strategy.BBOX(), saveStrategyPoly],
//            projection: new OpenLayers.Projection("EPSG:4326"),
//            protocol: new OpenLayers.Protocol.WFS({
//                version: "1.1.0",
//                srsName: "EPSG:4326",
//                url: "http://localhost:9000/geoserver/swa/wfs",
//                featureNS :  "swa",
//                featureType: "features",
//                geometryName: "geom_poly"
//            })
//        });
//
//        wfsPoly.events.register('featureadded',this,function(e){
//            if(!e.feature.attributes.id) e.feature.attributes = settings.getDefaultValues();
//            $rootScope.$broadcast('featureadded', e.feature);
//        });
//
//
//        var layers = [wfsPoint,wfsPoly,wfsLine];



    // Public API here
    return {
      getLayers: function () {
        return layers;
      },
      getPointLayer: function () {
          return wfsPoint;
      },
        getLineLayer: function () {
            return wfsLine;
        },
        getPolyLayer: function () {
            return wfsPoly;
        },
        getPointFeatures: function () {
            return wfsPoint.features;
        },
        getLineFeatures: function () {
            return wfsLine.features;
        },
        getPolyFeatures: function () {
            return wfsPoly.features;
        },
        selectPoint : function(feature){

        },
      saveLayers: function () {
          saveStrategyPoint.save();
          saveStrategyLine.save();
          saveStrategyPoly.save();
          alert("saved :-)")
      }
    };
  });
