/**
 * Copyright (c) 2008-2011 The Open Planning Project
 * 
 * Published under the BSD license.
 * See https://github.com/opengeo/gxp/raw/master/license.txt for the full text
 * of the license.
 */

/**
 * @requires plugins/Tool.js
 */

/** api: (define)
 *  module = gxp.plugins
 *  class = RemoveOverlays
 */

/** api: (extends)
 *  plugins/Tool.js
 */
Ext.namespace("gxp.plugins");

/** api: constructor
 *  .. class:: RemoveLayer(config)
 *
 *    Plugin for removing all overlays from the map.
 */
gxp.plugins.SaveDefaultContext = Ext.extend(gxp.plugins.Tool, {
    
    /** api: ptype = gxp_removeoverlays */
    ptype: "gxp_saveDefaultContext",
    
    /** api: config[saveDefaultContextMenuText]
     *  ``String``
     */
    saveDefaultContextMenuText: "Save default context",

    /** api: config[saveDefaultContextActionTip]
     *  ``String``
     */
    saveDefaultContextActionTip: "Save current context as default one",
	
    /** api: config[contextSaveSuccessString]
     *  ``String``
     */
    contextSaveSuccessString: "Context saved succesfully",
    	
    /** api: config[contextSaveFailString]
     *  ``String``
     */
    contextSaveFailString: "Context not saved succesfully",
    
    /** api: method[addActions]
     */
    addActions: function() {
        var selectedLayer;
		
		var saveContext = new Ext.Button({
            menuText: this.saveDefaultContextMenuText,
            iconCls: "gxp-icon-savedefaultcontext",
            disabled: false,
            tooltip: this.saveDefaultContextActionTip,
            handler: function() {
			
				var handleSave = function(request){
				    if (request.status == 200) {
						var xmlContext = request.responseText;
						
					  OpenLayers.Request.PUT({
						  url: 'http://admin:1geosol2@demo1.geo-solutions.it/exist/rest/mapadmin/context.xml',
						  data: xmlContext,
						  //user: 'admin',
						  //password: '1geosol2',
						  //proxy: '',
						  callback: function(request) {
							  if (request.status == 201){
								  Ext.Msg.show({
									 title: this.contextSaveSuccessString,
									 msg: request.statusText,
									 buttons: Ext.Msg.OK,
									 icon: Ext.MessageBox.OK
								  });
							  } else {
								  Ext.Msg.show({
									 title:this.contextSaveFailString,
									 msg: request.statusText,
									 buttons: Ext.Msg.OK,
									 icon: Ext.MessageBox.ERROR
								  });
							  }
						  },
						  scope: this
					  });
					  
					} else {
						throw /*this.saveErrorText + */request.responseText;
					}
				};
				
				var configStr = Ext.util.JSON.encode(app.getState());  
				var url = app.xmlJsonTranslateService + "HTTPWebGISSave";
				
				OpenLayers.Request.issue({
					method: 'POST',
					url: url,
					data: configStr,
					callback: function(request) {
						handleSave(request);
					},
					scope: this
				});					
   
            },
            scope: this
        });
		
		var loadContext = new Ext.Button({
			menuText: this.saveDefaultContextMenuText,
			iconCls: "gxp-icon-savedefaultcontext",
			disabled: false,
			tooltip: this.saveDefaultContextActionTip,
			handler: function() {
			  OpenLayers.Request.issue({
				method: 'GET',
				url: 'http://demo1.geo-solutions.it/exist/rest/mapadmin/context.xml',
				callback: function(request) {
					if (request.status == 200) {
						var xmlContext = request.responseText;
						var url = app.xmlJsonTranslateService + "HTTPWebGISXmlUpload";
						
						OpenLayers.Request.issue({
							method: 'POST',
							url: url,
							data: xmlContext,
							callback: function(request) {
								if (request.status == 200) {										  	
								  var json_str = unescape(request.responseText);
								  json_str = json_str.replace(/\+/g, ' ');
								  
								  var config = Ext.util.JSON.decode(json_str);
								  
								  if(config && config.success && config.success===true){	
									//app = new GeoExplorer.Composer(config);
									app.loadUserConfig(json_str);
								  }
								}
							},
							scope: this
						});
						
					} else {
						throw /*this.saveErrorText + */request.responseText;
					}
				},
				scope: this
			  });
			}
		});
		
        var actions = gxp.plugins.SaveDefaultContext.superclass.addActions.apply(this, [ saveContext ]);        
        
        return actions;
    }
        
});

Ext.preg(gxp.plugins.SaveDefaultContext.prototype.ptype, gxp.plugins.SaveDefaultContext);