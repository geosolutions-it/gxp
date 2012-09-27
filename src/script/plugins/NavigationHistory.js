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
 *  class = NavigationHistory
 */

/** api: (extends)
 *  plugins/Tool.js
 */
Ext.namespace("gxp.plugins");

/** api: constructor
 *  .. class:: NavigationHistory(config)
 *
 *    Provides two actions for zooming back and forth.
 */
gxp.plugins.NavigationHistory = Ext.extend(gxp.plugins.Tool, {
    
    /** api: ptype = gxp_navigationhistory */
    ptype: "gxp_navigationhistory",
    
    /** api: config[previousMenuText]
     *  ``String``
     *  Text for zoom previous menu item (i18n).
     */
    previousMenuText: "Zoom To Previous Extent",

    /** api: config[nextMenuText]
     *  ``String``
     *  Text for zoom next menu item (i18n).
     */
    nextMenuText: "Zoom To Next Extent",

    /** api: config[previousTooltip]
     *  ``String``
     *  Text for zoom previous action tooltip (i18n).
     */
    previousTooltip: "Zoom To Previous Extent",

    /** api: config[nextTooltip]
     *  ``String``
     *  Text for zoom next action tooltip (i18n).
     */
    nextTooltip: "Zoom To Next Extent",
    
    /** private: method[constructor]
     */
    constructor: function(config) {
        gxp.plugins.NavigationHistory.superclass.constructor.apply(this, arguments);
    },

    /** api: method[addActions]
     */
    addActions: function() {
        var self = this;
        var historyControl = new OpenLayers.Control.NavigationHistory();
        this.target.mapPanel.map.addControl(historyControl);
        var actions = [new GeoExt.Action({
            menuText: this.previousMenuText,
            iconCls: "gxp-icon-zoom-previous",
            tooltip: this.previousTooltip,
            disabled: true,
            control: historyControl.previous
        }), new GeoExt.Action({
            menuText: this.nextMenuText,
            iconCls: "gxp-icon-zoom-next",
            tooltip: this.nextTooltip,
            disabled: true,
            control: historyControl.next
        })];
        
        this.target.on("timemanager", function(){
                self.getTimeManager();
        });           
        
        return gxp.plugins.NavigationHistory.superclass.addActions.apply(this, [actions]);
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
						if (self.actions[1].items[0].pressed){
							self.actions[1].items[0].toggle();
						}                        
						self.actions[0].items[0].disable();
                        self.actions[1].items[0].disable();
					});	
			this.timeManager.events.register('stop', this, 
					function(){ 
						if (self.actions[0].control.active){
							self.actions[0].items[0].enable();
						}
						if (self.actions[1].control.active){
							self.actions[1].items[0].enable();
						}                    
						
                        
					});	
	    }
		return this.timeManager;
    }
        
});

Ext.preg(gxp.plugins.NavigationHistory.prototype.ptype, gxp.plugins.NavigationHistory);
