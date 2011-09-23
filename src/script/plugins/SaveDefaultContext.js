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
			      needsAuthorization: true,
            menuText: this.saveDefaultContextMenuText,
            iconCls: "gxp-icon-savedefaultcontext",
            disabled: true,
            tooltip: this.saveDefaultContextActionTip,
            handler: function() {
            
			  var app = this.target;
				var xmlContext;
				var handleSave = function(){
					  var xmlContext = this.xmlContext;
					  /*OpenLayers.Request.PUT({
						  url: 'http://admin:1geosol2@demo1.geo-solutions.it/exist/rest/mapadmin/context.xml',
						  data: xmlContext,
						  user: 'admin',
						  password: '1geosol2',
						  //proxy: '',
						  callback: function(request) {
							  if (request.status == 201){
								  Ext.Msg.show({
									 title: this.contextSaveSuccessString,
									 msg: request.statusText,
									 buttons: Ext.Msg.OK,
									 icon: Ext.MessageBox.OK,
									 scope: this
								  });
							  } else {
								  Ext.Msg.show({
									 title:this.contextSaveFailString,
									 msg: request.statusText,
									 buttons: Ext.Msg.OK,
									 icon: Ext.MessageBox.ERROR,
									 scope: this
								  });
							  }
						  },
						  scope: this
					  });*/
					  
            /*var xmlhttp = null;
            var request = null;
            try {
              xmlhttp = new XMLHttpRequest();
            } catch(e) {
              try {
                xmlhttp = new ActiveXObject("Msxml2.XMLHTTP");
              } catch(e) {
                xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
              }
            }
            
            var mask = Ext.Msg;                      
            xmlhttp.onreadystatechange = function requestHandler() {
                  if (request.readyState == 4 && request.status == 201) {
                      mask.show({
                         title: "Context saved succesfully",
                         msg: request.statusText,
                         buttons: Ext.Msg.OK,
                         icon: Ext.MessageBox.OK
                      });
                  }else if(request.readyState == 4){
                      mask.show({
                         title: "Context not saved succesfully",
                         msg: request.statusText,
                         buttons: Ext.Msg.OK,
                         icon: Ext.MessageBox.ERROR
                      });
                  }
            };
            
            request = xmlhttp;
            request.open("PUT", "proxy/?url=http://admin:1geosol2@demo1.geo-solutions.it/exist/rest/mapadmin/context.xml");
            request.send(xmlContext);*/
            
            var mask = new Ext.LoadMask(Ext.getBody(), {msg:"Please wait..."});
					  mask.show();
								
            Ext.Ajax.request({
               url: "proxy/?url=" + "http://admin:1geoadmin2@demo1.geo-solutions.it/exist/rest/mapadmin/context.xml",
               method: 'PUT',
               params: xmlContext,
               scope: this,
               success: function(response, opts){
                  mask.hide();
                  app.modified = false;
                  //modified = false;
                  Ext.Msg.show({
                       title: this.contextSaveSuccessString,
                       msg: response.statusText,
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
				};
				
				var configStr = Ext.util.JSON.encode(app.getState());  
				var url = app.xmlJsonTranslateService + "HTTPWebGISSave";
				
				OpenLayers.Request.issue({
            method: 'POST',
            url: url,
            data: configStr,
            callback: function(request) {
              if (request.status == 200) {
                this.xmlContext = request.responseText;
                handleSave.call(this);
              } else {
                //throw this.saveErrorText + request.responseText;
                throw request.responseText;
              }						
            },
            scope: this
          });				
   
            },
            scope: this
        });
		
        var actions = gxp.plugins.SaveDefaultContext.superclass.addActions.apply(this, [ saveContext ]);        
        
        return actions;
    }
        
});

Ext.preg(gxp.plugins.SaveDefaultContext.prototype.ptype, gxp.plugins.SaveDefaultContext);