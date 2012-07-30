/**
 * Copyright (c) 2008-2011 The Open Planning Project
 * 
 * Published under the GPL license.
 * See https://github.com/opengeo/gxp/raw/master/license.txt for the full text
 * of the license.
 */

/**
 * @requires plugins/Tool.js
 */

/** api: (define)
 *  module = gxp.plugins
 *  class = ImportKML
 */

/** api: (extends)
 *  plugins/Tool.js
 */
Ext.namespace("gxp.plugins");

/** api: constructor
 *  .. class:: ImportKML(config)
 *
 *    Allows to upload KML files.
 */
gxp.plugins.KMLExporter = Ext.extend(gxp.plugins.Tool, {
    
    /** api: ptype = gxp_export_kml */
    ptype: "gxp_export_kml",
    
    /** api: config[importKMLMenuText]
     *  ``String``
     *  Text for import KML item (i18n).
     */
    exportKMLMenuText: "Export KML",


    /** api: config[importKMLTooltip]
     *  ``String``
     *  Text for import KML tooltip (i18n).
     */
    exportKMLTooltip: "Export KML",
  
    /** api: config[uploadWindowTitle]
     *  ``String``
     *  Title of the window (i18n).
     */
    downloadWindowTitle: 'Download KML file',

	customLayerDefaultName: "Custom layer",
    
    /** private: method[constructor]
     */
    constructor: function(config) {
        gxp.plugins.KMLExporter.superclass.constructor.apply(this, arguments);
    },

    /** api: method[addActions]
     */
    addActions: function() {
	
		// open an upload file window
        var actions = [{
            menuText: this.exportKMLMenuText,
            iconCls: "gxp-icon-export-kml",
            tooltip: this.exportKMLTooltip,
            handler: function() {
				var layer = this.getCustomLayer();
				var format = new OpenLayers.Format.KML({
				        'maxDepth':10,
				        'extractStyles':true,
				        // 'internalProjection': map.baseLayer.projection,
				        'externalProjection': new OpenLayers.Projection("EPSG:4326")
				    });
				if ( layer && layer.features ){
					var kml = format.write(layer.features);
					// TOFIX show the result in a msg box
					Ext.Msg.alert('Export KML', Ext.util.Format.htmlEncode( kml ));
				} else {
					Ext.Msg.alert('Export KML', 'No custom features in this map');
				}
				

            },
            scope: this
        }];
        return gxp.plugins.KMLExporter.superclass.addActions.apply(this, [actions]);
    },

   	/** private: method[getCustomLayer]
      * returns the layer with custom features
     */
   getCustomLayer: function(){
	   var layers = this.target.mapPanel.map.getLayersByName(this.customLayerDefaultName);
		if (layers && layers.length > 0){
			return layers[0];
		} 
		return null;
   }

});

Ext.preg(gxp.plugins.KMLExporter.prototype.ptype, gxp.plugins.KMLExporter);
