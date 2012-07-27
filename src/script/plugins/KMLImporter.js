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
gxp.plugins.KMLImporter = Ext.extend(gxp.plugins.Tool, {
    
    /** api: ptype = gxp_import_kml */
    ptype: "gxp_import_kml",
    
    /** api: config[importKMLMenuText]
     *  ``String``
     *  Text for import KML item (i18n).
     */
    importKMLMenuText: "Import KML",


    /** api: config[importKMLTooltip]
     *  ``String``
     *  Text for import KML tooltip (i18n).
     */
    importKMLTooltip: "Import KML",
  
    /** api: config[uploadWindowTitle]
     *  ``String``
     *  Title of the window (i18n).
     */
    uploadWindowTitle: 'Upload KML file',
    
    /** private: method[constructor]
     */
    constructor: function(config) {
        gxp.plugins.KMLImporter.superclass.constructor.apply(this, arguments);
    },

    /** api: method[addActions]
     */
    addActions: function() {
		var xmlJsonTranslateService = this.target.xmlJsonTranslateService;
		// open an upload file window
        var actions = [{
            menuText: this.importKMLMenuText,
            iconCls: "gxp-icon-import-kml",
            tooltip: this.importKMLTooltip,
            handler: function() {
	            var self = this;
				// create an upload file form
				var form = new gxp.KMLFileUploadPanel( {
					xmlJsonTranslateService: xmlJsonTranslateService
				} );
				// open a modal window
				var win = new Ext.Window({
					       closable:true,
						   title: this.uploadWindowTitle,
						   iconCls: "gxp-icon-import-kml",
						   border:false,
						   modal: true, 
						   bodyBorder: false,
					       items: [ form ]
					});		
				form.on("uploadcomplete", function addLayer(caller, response){
						// the code to access the uploaded file
						var code = response.code;
						var layername = self.createLayerName( response.filename );
						// create a new layer from uploaded file
						var kmlLayer = new OpenLayers.Layer.Vector(layername, {
											projection: new OpenLayers.Projection("EPSG:4326"),
											strategies: [new OpenLayers.Strategy.Fixed()],
											protocol: new OpenLayers.Protocol.HTTP({
												url: xmlJsonTranslateService+'/FileUploader?code='+code,
												format: new OpenLayers.Format.KML({
														extractStyles: true, 
														extractAttributes: true,
														maxDepth: 2
													})
											})
										});
						// add the new layer to current map
						self.target.mapPanel.map.addLayer(kmlLayer);
						// destroy the window
						win.destroy();
					});
				// show window
				win.show(); 

            },
            scope: this
        }];
        return gxp.plugins.KMLImporter.superclass.addActions.apply(this, [actions]);
    },

 	/** private: method[createLayerName]
     * utility method to create unique names for layers: add a progressive number.
     */
	createLayerName: function(name){
		var map = this.target.mapPanel.map;
		var i = 2;
		var trial = name;
		while(true){
			var layers = map.getLayersByName( trial );
			if (layers.length === 0){
				return trial;
			} else {
				trial = name + ' ('+i+')';
				i++;
			}
		}
			
		
	}

});

Ext.preg(gxp.plugins.KMLImporter.prototype.ptype, gxp.plugins.KMLImporter);
