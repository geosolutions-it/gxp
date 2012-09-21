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
 *  class = Navigation
 */

/** api: (extends)
 *  plugins/Tool.js
 */
Ext.namespace("gxp.plugins");

/** api: constructor
 *  .. class:: Navigation(config)
 *
 *    Provides one action for panning the map and zooming in with
 *    a box. Optionally provide mousewheel zoom support.
 */
gxp.plugins.Navigation = Ext.extend(gxp.plugins.Tool, {
    
    /** api: ptype = gxp_navigation */
    ptype: "gxp_navigation",
    
    /** api: config[menuText]
     *  ``String``
     *  Text for navigation menu item (i18n).
     */
    menuText: "Pan Map",

    /** api: config[tooltip]
     *  ``String``
     *  Text for navigation action tooltip (i18n).
     */
    tooltip: "Pan Map",

    /** private: method[constructor]
     */
    constructor: function(config) {
        gxp.plugins.Navigation.superclass.constructor.apply(this, arguments);
    },

    /** api: method[addActions]
     */
    addActions: function() {
        var self = this;
        this.controlOptions = this.controlOptions || {};
        Ext.applyIf(this.controlOptions, {zoomWheelEnabled: true});
        var actions = [new GeoExt.Action({
            tooltip: this.tooltip,
            menuText: this.menuText,
            iconCls: "gxp-icon-pan",
            enableToggle: true,
            pressed: true,
            allowDepress: false,
            control: new OpenLayers.Control.Navigation(this.controlOptions),
            map: this.target.mapPanel.map,
            toggleGroup: this.toggleGroup})];
            
            this.target.on("timemanager", function(){
                    self.getTimeManager();
            });            
        
        return gxp.plugins.Navigation.superclass.addActions.apply(this, [actions]);
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
					});	
			this.timeManager.events.register('stop', this, 
					function(){ 
						self.actions[0].items[0].enable();
					});	
	    }
		return this.timeManager;
    }
        
});

Ext.preg(gxp.plugins.Navigation.prototype.ptype, gxp.plugins.Navigation);
