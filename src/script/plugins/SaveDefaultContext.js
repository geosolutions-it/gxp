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
		
		var saveContext = new Ext.Button({
		        id: "save-context-button",
            menuText: this.saveDefaultContextMenuText,
            iconCls: "gxp-icon-savedefaultcontext",
            disabled: false,
            tooltip: this.saveDefaultContextActionTip,
            handler: function() {
                  var configStr = Ext.util.JSON.encode(app.getState()); 
                  
                  var mask = new Ext.LoadMask(Ext.getBody(), {msg:"Please wait..."});
                  mask.show();
                      
                  Ext.Ajax.request({
                     url: proxy + geoStoreBaseURL + "data/" + mapId,
                     method: 'PUT',
                     headers:{
                        'Content-type' : 'application/json'
                     },
                     params: configStr,
                     scope: this,
                     success: function(response, opts){
                        mask.hide();
                        app.modified = false;
                        //modified = false;
                        Ext.Msg.show({
                             title: this.contextSaveSuccessString,
                             msg: response.statusText + " Map successfully saved",
                             buttons: Ext.Msg.OK,
                             icon: Ext.MessageBox.OK
                        });
                     },
                     failure:  function(response, opts){
                        mask.hide();
                        Ext.Msg.show({
                           title: this.contextSaveFailString,
                           msg: response.statusText,
                           buttons: Ext.Msg.OK,
                           icon: Ext.MessageBox.ERROR
                        });
                     }
                  });   
            },
            scope: this
        });
		
        var actions = gxp.plugins.SaveDefaultContext.superclass.addActions.apply(this, [ saveContext ]);        
        
        return actions;
    }
        
});

Ext.preg(gxp.plugins.SaveDefaultContext.prototype.ptype, gxp.plugins.SaveDefaultContext);