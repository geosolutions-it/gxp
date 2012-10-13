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

	alternativeStyle: false,
    
    /** private: method[constructor]
     */
    constructor: function(config) {
        gxp.plugins.KMLExporter.superclass.constructor.apply(this, arguments);
		// this.layer = config.layer;
		this.alternativeStyle = config.alternativeStyle || false;
		this.toggleGroup = config.toggleGroup;
		this.srs = config.srs || "EPSG:4326";
    },

	addOutput: function(config){
		var map = this.target.mapPanel.map;
		var xmlJsonTranslateService = this.target.proxy + encodeURIComponent(this.target.xmlJsonTranslateService);
		
		var self = this;
		this.exportButton = new Ext.Button({
			toggleGroup: self.toggleGroup,
			menuText: this.exportKMLMenuText,
			disabled: true,
            iconCls: "gxp-icon-export-kml",
            tooltip: this.exportKMLTooltip,
			scope: this,
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
			}
		});
		
		
		// open an upload file window
        var actions = [
			this.exportButton
      	];
        return gxp.plugins.KMLExporter.superclass.addActions.apply(this, [actions]);		
	},

    /** api: method[addActions]
     */
    addActions: function() {
	
		this.target.on('ready', function(){
			
				this.layer = this.createLayer( this.target.mapPanel.map);
				
						var self = this;
						this.layer.events.on({
							'featureadded': function(feature){
								self.exportButton.enable();
							},
							'featuresremoved': function( features ){
								if ( self.layer.features.length <= 0 ){
									self.exportButton.toggle( false );
									self.exportButton.disable();
								}
							},
							'featureremoved': function(deleted){
								if ( self.layer.features.length <= 0 ){
									self.exportButton.toggle( false );
									self.exportButton.disable();
								}
							}
						});				
				
				this.addOutput();

		}, this);
	

    },

    /**
     *  create a custom layer or it returns an existing one
     */
  createLayer: function( map ){
		var layers = map.getLayersByName( this.layerName );
		if ( layers.length > 0 ){
			return layers[0]; // return the first layer with the given name
		} else {
			var layer;
			if ( this.alternativeStyle ){
				layer = new OpenLayers.Layer.Vector( this.layerName, {
					projection: new OpenLayers.Projection(this.srs), 
					styleMap: new OpenLayers.StyleMap({
						"default": new OpenLayers.Style({
							strokeColor: "red",
							strokeOpacity: .7,
							strokeWidth: 2,
							fillColor: "red",
							fillOpacity: 0,
							cursor: "pointer"
						}),
						"temporary": new OpenLayers.Style({
							strokeColor: "#ffff33",
							strokeOpacity: .9,
							strokeWidth: 2,
							fillColor: "#ffff33",
							fillOpacity: .3,
							cursor: "pointer"
						}),
						"select": new OpenLayers.Style({
							strokeColor: "#0033ff",
							strokeOpacity: .7,
							strokeWidth: 3,
							fillColor: "#0033ff",
							fillOpacity: 0,
							graphicZIndex: 2,
							cursor: "pointer"
						})
					})
				});				
			} else {
				layer = new OpenLayers.Layer.Vector( this.layerName, {
					projection: new OpenLayers.Projection(this.srs)
				});	
			}

			map.addLayer( layer );
			return layer;
		}
	}


});

Ext.preg(gxp.plugins.KMLExporter.prototype.ptype, gxp.plugins.KMLExporter);
