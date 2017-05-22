/**
 * Copyright (c) 2017 OSGeo
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

/**
 * @requires plugins/LayerSource.js
 * @requires OpenLayers/Layer/XYZ.js
 */

/** api: (define)
 *  module = gxp.plugins
 *  class = XYZLayerSource
 */

/** api: (extends)
 *  plugins/LayerSource.js
 */
Ext.namespace("gxp.plugins");

/** api: constructor
 *  .. class:: XYZLayerSource(config)
 *
 *    Plugin for using Tile layers with :class:`gxp.Viewer` instances.
 */
/** api: example
 *  The configuration in the ``sources`` property of the :class:`gxp.Viewer` is
 *  straightforward:
 *
 *  .. code-block:: javascript
 *
 *    "tiled": {
 *        ptype: "gxp_xyzlayersource"
 *    }
 *
 *  A typical configuration for a layer from this source (in the ``layers``
 *  array of the viewer's ``map`` config option would look like this:
 *
 *  .. code-block:: javascript
 *
 *    {
 *        source: "tiled",
 *        name: "tiledlayer"
 *    }
 *
 */
gxp.plugins.XYZLayerSource = Ext.extend(gxp.plugins.LayerSource, {

    /** api: ptype = gxp_xyzlayersource */
    ptype: "gxp_xyzlayersource",

    /** api: property[store]
     *  ``GeoExt.data.LayerStore``. Will contain records with "mapnik" and
     *  "osmarender" as name field values.
     */

    /** api: config[title]
     *  ``String``
     *  A descriptive title for this layer source (i18n).
     */
    title: "Tiled Layer",

    /** api: config[tileStreamLayerName]
     *  ``String``
     *  Title string for generated layer.
     */
    tileStreamLayerName: "Tiled Layer",

    /** api: config[tileStreamLayerURL]
     *  ``String``
     *  Base URL string for generated layer.
     */
    tileStreamLayerURL: "http://tileStreamLayerURL/${z}/${x}/${y}.png",

    /** api: config[tileStreamLayerMaxZoom]
     *  ``Integer``
     *  Max Zoom Level.
     */
    tileStreamLayerMaxZoom: 19,

    /** api: config[tileStreamLayerAttribution]
     *  ``String``
     *  Attribution string for generated layer (i18n).
     */
    tileStreamLayerAttribution: "&copy;",

    /** api: method[createStore]
     *
     *  Creates a store of layer records.  Fires "ready" when store is loaded.
     */
    createStore: function() {
        var options = {
            sphericalMercator: true,
            wrapDateLine: true,
            projection: "EPSG:900913",
            maxExtent: new OpenLayers.Bounds(
                -128 * 156543.0339, -128 * 156543.0339,
                128 * 156543.0339, 128 * 156543.0339
            ),
            maxResolution: 156543.03390625,
            numZoomLevels: 19,
            units: "m",
            buffer: 1,
            transitionEffect: "resize"
        };

        var layer = new OpenLayers.Layer.XYZ(
          this.tileStreamLayerName,
          [this.tileStreamLayerURL],
          OpenLayers.Util.applyDefaults({
            attribution: this.tileStreamLayerAttribution,
            layername: this.tileStreamLayerName,
            numZoomLevels: this.tileStreamLayerMaxZoom
          }, options)
        );

        var layers = [layer];

        this.store = new GeoExt.data.LayerStore({
            layers: layers,
            fields: [
                {name: "source", type: "string"},
                {name: "name", type: "string", mapping: "type"},
                {name: "abstract", type: "string", mapping: "attribution"},
                {name: "group", type: "string", defaultValue: "background"},
                {name: "fixed", type: "boolean", defaultValue: true},
                {name: "selected", type: "boolean"}
            ]
        });
        this.store.each(function(l) {
            l.set("group", "background");
        });
        this.fireEvent("ready", this);

    },

    /** api: method[createLayerRecord]
     *  :arg config:  ``Object``  The application config for this layer.
     *  :returns: ``GeoExt.data.LayerRecord``
     *
     *  Create a layer record given the config.
     */
     createLayerRecord: function(config) {
         var record = this.store.getAt(0).copy(Ext.data.Record.id({}));

         var layer = record.getLayer().clone();

         // set layer title from config
         if (config.title) {
             /**
             * Because the layer title data is duplicated, we have
             * to set it in both places.  After records have been
             * added to the store, the store handles this
             * synchronization.
             */
             layer.setName(config.title);
             record.set("title", config.title);
         }

         // set visibility from config
         if ("visibility" in config) {
             layer.visibility = config.visibility;
         }

         // apply properties that may have come from saved config
         if ("tileStreamLayerName" in config) {
             layer.name = config.tileStreamLayerName;
             layer.layername = config.tileStreamLayerName;
         }
         if ("tileStreamLayerURL" in config) {
             layer.url = [config.tileStreamLayerURL];
         }
         if ("tileStreamLayerMaxZoom" in config) {
             layer.numZoomLevels = config.tileStreamLayerMaxZoom;
         }
         if ("tileStreamLayerAttribution" in config) {
             layer.attribution = config.tileStreamLayerAttribution;
         }

         record.set("selected", config.selected || false);
         record.set("source", config.source);
         record.set("name", config.name);
         if ("group" in config) {
             record.set("group", config.group);
         }

         record.data.layer = layer;
         record.commit();

         return record;
     }

});

Ext.preg(gxp.plugins.XYZLayerSource.prototype.ptype, gxp.plugins.XYZLayerSource);
