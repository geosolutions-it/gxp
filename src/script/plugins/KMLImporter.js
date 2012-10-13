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

	alternativeStyle: false,
    
    /** private: method[constructor]
     */
    constructor: function(config) {
        gxp.plugins.KMLImporter.superclass.constructor.apply(this, arguments);
		// this.layer = config.layer;
		this.alternativeStyle = config.alternativeStyle || false;
		this.srs = config.srs || "EPSG:4326";
		this.toggleGroup = config.toggleGroup;
    },

	addOutput: function(config){
			var self = this;
			var map = this.target.mapPanel.map;
			var xmlJsonTranslateService = this.target.proxy + this.target.xmlJsonTranslateService;
			// open an upload file window
	        var actions = [{
				toggleGroup: self.toggleGroup,
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
							   resizable: false,
							   width: 500,
						       items: [ form ]
						});		
					form.on("uploadcomplete", function addKMLToLayer(caller, response){
							// the code to access the uploaded file
							var code = response.code;

							var Request = Ext.Ajax.request({
						       url: xmlJsonTranslateService+'/FileUploader?code='+code,
						       method: 'GET',
						       headers:{
						          'Content-Type' : 'application/xml'
						       },
						       scope: this,
						       success: function(response, opts){
									var format = new OpenLayers.Format.KML({
								    	extractStyles: true, 
										extractAttributes: true,
										maxDepth: 2 //,
										// externalProjection: new OpenLayers.Projection("EPSG:4326"),
										// internalProjection: map.getProjection()
								    });
									// console.log( response.responseText );
								    var features = format.read(response.responseText);
								
									// for imported features create a string represention of their value
									for (var i=0; i<features.length; i++){
										var attributes = features[i].attributes;
										for (var attributeName in attributes ){
											// console.log(attributeName);
											if (typeof attributes[attributeName] == "object") {
												if (attributes[attributeName].value) {
													attributes[attributeName] = attributes[attributeName].value;
												}
											}
										}
									}
								
									// console.log(features);
								    self.layer.addFeatures( features );
						       },
						       failure:  function(response, opts){
						       		console.error(response);
						       }
						    });

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

    /** api: method[addActions]
     */
    addActions: function() {
		this.target.on('ready', function(){
				this.layer = this.createLayer( this.target.mapPanel.map);
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
					projection: new OpenLayers.Projection( this.srs ), 
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
					projection: new OpenLayers.Projection( this.srs )
				});	
			}

			map.addLayer( layer );
			return layer;
		}
	}

});

Ext.preg(gxp.plugins.KMLImporter.prototype.ptype, gxp.plugins.KMLImporter);
