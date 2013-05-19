'use strict';

angular.module('udm.util')
  .factory('util', function () {
    // Service logic



    // Public API here
    return {
        WKTToFeature : function(wkt,attr){
            var WKTParser = new OpenLayers.Format.WKT();

            var feature = WKTParser.read(wkt.geom);
            feature.geometry.transform(new OpenLayers.Projection("EPSG:4326"),new OpenLayers.Projection("EPSG:900913"));

            feature.attributes = attr;

            return feature;
        },
        featureToWKT : function(feature){
            var WKTParser = new OpenLayers.Format.WKT();

            feature = feature.clone();
            feature.geometry.transform(new OpenLayers.Projection("EPSG:900913"),new OpenLayers.Projection("EPSG:4326"));

            return {attr : feature.attributes, geom : WKTParser.write(feature)};
        }
    };
  });
