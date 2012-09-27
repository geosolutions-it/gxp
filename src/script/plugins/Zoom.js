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
 *  class = Zoom
 */

/** api: (extends)
 *  plugins/Tool.js
 */
Ext.namespace("gxp.plugins");

/** api: constructor
 *  .. class:: Zoom(config)
 *
 *    Provides two actions for zooming in and out.
 */
gxp.plugins.Zoom = Ext.extend(gxp.plugins.Tool, {
    
    /** api: ptype = gxp_zoom */
    ptype: "gxp_zoom",
    
    /** api: config[zoomInMenuText]
     *  ``String``
     *  Text for zoom in menu item (i18n).
     */
    zoomInMenuText: "Zoom In",

    /** api: config[zoomOutMenuText]
     *  ``String``
     *  Text for zoom out menu item (i18n).
     */
    zoomOutMenuText: "Zoom Out",

    /** api: config[zoomInTooltip]
     *  ``String``
     *  Text for zoom in action tooltip (i18n).
     */
    zoomInTooltip: "Zoom In",

    /** api: config[zoomOutTooltip]
     *  ``String``
     *  Text for zoom out action tooltip (i18n).
     */
    zoomOutTooltip: "Zoom Out",
    
    /** private: method[constructor]
     */
    constructor: function(config) {
        gxp.plugins.Zoom.superclass.constructor.apply(this, arguments);
    },

    /** api: method[addActions]
     */
    addActions: function() {
        var self = this;
        var actions = [{
            menuText: this.zoomInMenuText,
            iconCls: "gxp-icon-zoom-in",
            tooltip: this.zoomInTooltip,
            handler: function() {
                this.target.mapPanel.map.zoomIn();    
            },
            scope: this
        }, {
            menuText: this.zoomOutMenuText,
            iconCls: "gxp-icon-zoom-out",
            tooltip: this.zoomOutTooltip,
            handler: function() {
                this.target.mapPanel.map.zoomOut();
            },
            scope: this
        }];
        
        this.target.on("timemanager", function(){
                self.getTimeManager();
        });        
        
        return gxp.plugins.Zoom.superclass.addActions.apply(this, [actions]);
    },
    getTimeManager: function(){
	    if ( ! this.timeManager ){ // if it is not initialized
			var timeManagers = this.target.mapPanel.map.getControlsByClass('OpenLayers.Control.TimeManager');
			if (timeManagers.length <= 0){
				console.error('Cannot init Synchronizer: no TimeManager found');
				return;
			}
			this.timeManager = timeManagers[0];
			var self = this;
			// listen to play events
			this.timeManager.events.register('play', this, 
					function(){ 
						if (self.actions[0].items[0].pressed){
							self.actions[0].items[0].toggle();
						}
						self.actions[0].items[0].disable();
                        self.actions[1].items[0].disable();
					});	
			this.timeManager.events.register('stop', this, 
					function(){ 
						self.actions[0].items[0].enable();
                        self.actions[1].items[0].enable();
					});	
	    }
		return this.timeManager;
    }
        
});

Ext.preg(gxp.plugins.Zoom.prototype.ptype, gxp.plugins.Zoom);
