/**
 * Method: setStyle
 * Use to set all the style attributes to a SVG node.
 *
 * Takes care to adjust stroke width and point radius to be
 * resolution-relative
 *
 * Parameters:
 * node - {SVGDomElement} An SVG element to decorate
 * style - {Object}
 * options - {Object} Currently supported options include
 *                              'isFilled' {Boolean} and
 *                              'isStroked' {Boolean}
 */
OpenLayers.Renderer.SVG.prototype.setStyle = function(node, style, options) {
    style = style  || node._style;
    options = options || node._options;
    var r = parseFloat(node.getAttributeNS(null, "r"));
    var widthFactor = 1;
    var pos;
    if (node._geometryClass == "OpenLayers.Geometry.Point" && r) {
        node.style.visibility = "";
        if (style.graphic === false) {
            node.style.visibility = "hidden";
        } else if (style.externalGraphic) {
            pos = this.getPosition(node);

            if (style.graphicTitle) {
                node.setAttributeNS(null, "title", style.graphicTitle);
                //Standards-conformant SVG
                // Prevent duplicate nodes. See issue https://github.com/openlayers/openlayers/issues/92
                var titleNode = node.getElementsByTagName("title");
                if (titleNode.length > 0) {
                    titleNode[0].firstChild.textContent = style.graphicTitle;
                } else {
                    var label = this.nodeFactory(null, "title");
                    label.textContent = style.graphicTitle;
                    node.appendChild(label);
                }
            }
            if (style.graphicWidth && style.graphicHeight) {
                node.setAttributeNS(null, "preserveAspectRatio", "none");
            }
            var width = style.graphicWidth || style.graphicHeight;
            var height = style.graphicHeight || style.graphicWidth;
            width = width ? width : style.pointRadius*2;
            height = height ? height : style.pointRadius*2;
            var xOffset = (style.graphicXOffset != undefined) ?
                style.graphicXOffset : -(0.5 * width);
            var yOffset = (style.graphicYOffset != undefined) ?
                style.graphicYOffset : -(0.5 * height);

            var opacity = style.graphicOpacity || style.fillOpacity;

            node.setAttributeNS(null, "x", (pos.x + xOffset).toFixed());
            node.setAttributeNS(null, "y", (pos.y + yOffset).toFixed());
            node.setAttributeNS(null, "width", width);
            node.setAttributeNS(null, "height", height);

            //changed
            if(style.externalGraphic === true && style.externalStaticGraphic){
                if(node.href.animVal == ''){
                    node.setAttributeNS(this.xlinkns, "href", style.externalStaticGraphic);
                }
            }
            else{
                node.setAttributeNS(this.xlinkns, "href", style.externalGraphic);
            }
            //------------------

            node.setAttributeNS(null, "style", "opacity: "+opacity);
            node.onclick = OpenLayers.Renderer.SVG.preventDefault;
        } else if (this.isComplexSymbol(style.graphicName)) {
            // the symbol viewBox is three times as large as the symbol
            var offset = style.pointRadius * 3;
            var size = offset * 2;
            var src = this.importSymbol(style.graphicName);
            pos = this.getPosition(node);
            widthFactor = this.symbolMetrics[src.id][0] * 3 / size;

            // remove the node from the dom before we modify it. This
            // prevents various rendering issues in Safari and FF
            var parent = node.parentNode;
            var nextSibling = node.nextSibling;
            if(parent) {
                parent.removeChild(node);
            }

            // The more appropriate way to implement this would be use/defs,
            // but due to various issues in several browsers, it is safer to
            // copy the symbols instead of referencing them.
            // See e.g. ticket http://trac.osgeo.org/openlayers/ticket/2985
            // and this email thread
            // http://osgeo-org.1803224.n2.nabble.com/Select-Control-Ctrl-click-on-Feature-with-a-graphicName-opens-new-browser-window-tc5846039.html
            node.firstChild && node.removeChild(node.firstChild);
            node.appendChild(src.firstChild.cloneNode(true));
            node.setAttributeNS(null, "viewBox", src.getAttributeNS(null, "viewBox"));

            node.setAttributeNS(null, "width", size);
            node.setAttributeNS(null, "height", size);
            node.setAttributeNS(null, "x", pos.x - offset);
            node.setAttributeNS(null, "y", pos.y - offset);

            // now that the node has all its new properties, insert it
            // back into the dom where it was
            if(nextSibling) {
                parent.insertBefore(node, nextSibling);
            } else if(parent) {
                parent.appendChild(node);
            }
        } else {
            node.setAttributeNS(null, "r", style.pointRadius);
        }

        var rotation = style.rotation;

        if ((rotation !== undefined || node._rotation !== undefined) && pos) {
            node._rotation = rotation;
            rotation |= 0;
            if (node.nodeName !== "svg") {
                node.setAttributeNS(null, "transform",
                    "rotate(" + rotation + " " + pos.x + " " +
                        pos.y + ")");
            } else {
                var metrics = this.symbolMetrics[src.id];
                node.firstChild.setAttributeNS(null, "transform", "rotate("
                    + rotation + " "
                    + metrics[1] + " "
                    + metrics[2] + ")");
            }
        }
    }

    if (options.isFilled) {
        node.setAttributeNS(null, "fill", style.fillColor);
        node.setAttributeNS(null, "fill-opacity", style.fillOpacity);
    } else {
        node.setAttributeNS(null, "fill", "none");
    }

    if (options.isStroked) {
        node.setAttributeNS(null, "stroke", style.strokeColor);
        node.setAttributeNS(null, "stroke-opacity", style.strokeOpacity);
        node.setAttributeNS(null, "stroke-width", style.strokeWidth * widthFactor);
        node.setAttributeNS(null, "stroke-linecap", style.strokeLinecap || "round");
        // Hard-coded linejoin for now, to make it look the same as in VML.
        // There is no strokeLinejoin property yet for symbolizers.
        node.setAttributeNS(null, "stroke-linejoin", "round");
        style.strokeDashstyle && node.setAttributeNS(null,
            "stroke-dasharray", this.dashStyle(style, widthFactor));
    } else {
        node.setAttributeNS(null, "stroke", "none");
    }

    if (style.pointerEvents) {
        node.setAttributeNS(null, "pointer-events", style.pointerEvents);
    }

    if (style.cursor != null) {
        node.setAttributeNS(null, "cursor", style.cursor);
    }

    return node;
}