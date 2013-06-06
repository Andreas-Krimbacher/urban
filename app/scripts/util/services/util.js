'use strict';
/**
 * collection of different utility functions
 * @name Service:util
 * @namespace
 * @author Andreas Krimbacher
 */
angular.module('udm.util')
  .factory('util', function () {
    // Service logic



    // Public API here
    return {
        /**
         * generate a openlayers feature from wkt
         * @name Service:util#WKTToFeature
         * @function
         * @param wkt {object} wkt string in wkt.geom
         * @param attr {object} attributes object
         * @returns {object} openlayers feature
         */
        WKTToFeature : function(wkt,attr){
            var WKTParser = new OpenLayers.Format.WKT();

            var feature = WKTParser.read(wkt.geom);
            feature.geometry.transform(new OpenLayers.Projection("EPSG:4326"),new OpenLayers.Projection("EPSG:900913"));

            feature.attributes = attr;

            return feature;
        },
        /**
         * generates an object with a wkt string and attributes from an openlayers feature
         * @name Service:util#featureToWKT
         * @function
         * @param feature {object} feature
         * @returns {object} wkt and attributes
         */
        featureToWKT : function(feature){
            var WKTParser = new OpenLayers.Format.WKT();

            feature = feature.clone();
            feature.geometry.transform(new OpenLayers.Projection("EPSG:900913"),new OpenLayers.Projection("EPSG:4326"));

            return {attr : feature.attributes, geom : WKTParser.write(feature)};
        }
    };
  });
