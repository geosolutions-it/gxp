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
 *  class = EmbeddedLink
 */

/** api: (extends)
 *  plugins/EmbeddedLink.js
 */
Ext.namespace("gxp.plugins");

/** api: constructor
 *  .. class:: EmbeddedLink(config)
 *
 *    Open a dialog with the embedded link for the current map.
 */
gxp.plugins.EmbeddedLink = Ext.extend(gxp.plugins.Tool, {
    
    /** api: ptype = gxp_embedded_link */
    ptype: "gxp_embedded_link",
    
    /** api: config[embeddedLinkMenuText]
     *  ``String``
     *  Text for embedded link item (i18n).
     */
    embeddedLinkMenuText: "Embedded Link",


    /** api: config[embeddedLinkTooltip]
     *  ``String``
     *  Text for embedded link tooltip (i18n).
     */
    embeddedLinkTooltip: "Embedded Link",

	copyButtonText:"Copy to clipboard",
	copyButtonTooltip:"Copy to clipboard",
    
    /** private: method[constructor]
     */
    constructor: function(config) {
        gxp.plugins.EmbeddedLink.superclass.constructor.apply(this, arguments);
    },

    /** api: method[addActions]
     */
    addActions: function() {
	

	
		 var actions = [{
	            menuText: this.embeddedLinkMenuText,
	            iconCls: "gxp-icon-embedded-link",
	            tooltip: this.embeddedLinkTooltip,
	            handler: function() {
					var form = new Ext.FormPanel({
						width: 500,
						frame: true,
					    autoHeight: true,
						bodyStyle: 'padding: 10px 10px 0 10px;',
						labelWidth: 50,
						defaults: {
						     anchor: '95%',
						     allowBlank: false,
						     msgTarget: 'side'
						},
						items: [{
				            xtype: "textarea",
				            id: "embeddedLink",
				            value: this.createUrl() ,
							disabled:true,
				            fieldLabel: 'Link'
				        }]/*,
						buttons:[
							{
								text:'Copy to clipboard',
							 	handler: function(){
									console.log('copy');
								}
							}
						]*/
					});
					// open a modal window
					var win = new Ext.Window({
							       closable:true,
								   title: this.embeddedLinkMenuText,
								   iconCls: "gxp-icon-embedded-link",
								   border:false,
								   modal: true, 
								   bodyBorder: false,
							       items: [ form ]
						});
					win.show();
	            },
	            scope: this
	        }];
		return gxp.plugins.EmbeddedLink.superclass.addActions.apply(this, [actions]);
	},

  	createUrl: function(){
		
		 T = this.target;
	
		 var layers = this.target.mapPanel.map.layers;
		 var vehicleUrl = '';
		 for (var i=0; i<layers.length; i++){
			var layer = layers[i];
			if ( layer.visibility && layer.params && layer.params.CQL_FILTER ){
				vehicleUrl += encodeURIComponent(layer.params.CQL_FILTER) + ',';
			}
		 }
		
		 var currentUrl = window.location.href + '?';
		 currentUrl += 'bounds=' + this.target.mapPanel.map.getExtent().toString();
		 currentUrl += '&center=' + this.target.mapPanel.map.getCenter().lon +',' + this.target.mapPanel.map.getCenter().lat;
		 currentUrl += '&zoom=' + this.target.mapPanel.map.getZoom();
		 currentUrl += '&time=';
		 currentUrl += '&vehicles=' + vehicleUrl;
		
		return currentUrl;
	}

});

Ext.preg(gxp.plugins.EmbeddedLink.prototype.ptype, gxp.plugins.EmbeddedLink);
