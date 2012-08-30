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
    embeddedLinkMenuText: "Embed Link",


    /** api: config[embeddedLinkTooltip]
     *  ``String``
     *  Text for embedded link tooltip (i18n).
     */
    embeddedLinkTooltip: "Embed Link",

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
							readOnly:true,
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
		
		 // Note to self: in order to create urls dynamically, have a look at TimeSlider.js listeners
		 var timeManagers = this.target.mapPanel.map.getControlsByClass('OpenLayers.Control.TimeManager');
		
		 var currentUrl = location.protocol + '//' + location.host + location.pathname + '?';
		 currentUrl += 'bounds=' + this.target.mapPanel.map.getExtent().toString();
		 currentUrl += '&center=' + this.target.mapPanel.map.getCenter().lon +',' + this.target.mapPanel.map.getCenter().lat;
		 currentUrl += '&zoom=' + this.target.mapPanel.map.getZoom();
		
		 if ( timeManagers.length > 0 ){
			var timeManager = timeManagers[0];
			
			currentUrl += '&startTime=' + timeManager.range[0].toISOString(); 
			currentUrl += '&endTime=' + timeManager.range[1].toISOString();  
			currentUrl += '&timeUnit=' + timeManager.units;
		 } 
		
		 // get cruise name
		 // TODO is there a better way?
		 var cruiseName = Ext.getCmp('tree').title;
		 currentUrl += '&cruiseName=' + cruiseName;
		
		return currentUrl;
	}

});

Ext.preg(gxp.plugins.EmbeddedLink.prototype.ptype, gxp.plugins.EmbeddedLink);
