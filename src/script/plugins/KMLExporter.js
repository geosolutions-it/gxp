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

    
    /** private: method[constructor]
     */
    constructor: function(config) {
        gxp.plugins.KMLExporter.superclass.constructor.apply(this, arguments);
		this.layer = config.layer;
    },

    /** api: method[addActions]
     */
    addActions: function() {
	
		var map = this.target.mapPanel.map;
		var xmlJsonTranslateService = this.target.proxy + encodeURIComponent(this.target.xmlJsonTranslateService);
		
		var self = this;
		// open an upload file window
        var actions = [{
            menuText: this.exportKMLMenuText,
            iconCls: "gxp-icon-export-kml",
            tooltip: this.exportKMLTooltip,
            handler: function() {
				// create kml string from layer features
				var format = new OpenLayers.Format.KML({
					        'maxDepth':10,
					        'extractStyles':true,
							'foldersName': 'Gliders Export' //,
					       // 'internalProjection': map.getProjection(),
					       // 'externalProjection': new OpenLayers.Projection("EPSG:4326")
					    });
				var kmlContent = format.write(self.layer.features);
				// create an upload file form
				var form = new gxp.KMLFileDownloadPanel( {
					xmlJsonTranslateService: xmlJsonTranslateService,
					content: kmlContent
				} );
				// open a modal window
				var win = new Ext.Window({
					       closable:true,
						   title: this.downloadWindowTitle,
						   iconCls: "gxp-icon-export-kml",
						   border:false,
						   modal: true, 
						   bodyBorder: false,
						   resizable: false,
						   width: 500,
					       items: [ form ]
					});

	                   				
				// application/x-www-form-urlencoded
					
				form.on("uploadcomplete", function addKMLToLayer(caller, response){
					var code = response.code;
					var filename = response.filename;
					// force browser download
					location.href = xmlJsonTranslateService+'FileDownloader' + encodeURIComponent('?code=' + code +'&filename='+filename);
					win.destroy();
				});
				win.show(); 

            },
            scope: this
        }];
        return gxp.plugins.KMLExporter.superclass.addActions.apply(this, [actions]);
    }


});

Ext.preg(gxp.plugins.KMLExporter.prototype.ptype, gxp.plugins.KMLExporter);
