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
 *  class = Synchronizer
 */

/** api: (extends)
 *  plugins/Synchronizer.js
 */
Ext.namespace("gxp.plugins");

/** api: constructor
 *  .. class:: Synchronizer(config)
 *
 *    update the content of layers and the status of the time slider dynamically.
 */
gxp.plugins.Synchronizer = Ext.extend(gxp.plugins.Tool, {
    
	/** api: ptype = gxp_synchronizer */
    ptype: "gxp_synchronizer",

    /** private: method[constructor]
     */
    constructor: function(config) {
        gxp.plugins.Synchronizer.superclass.constructor.apply(this, arguments);
		this.timeInterval = config.refreshTimeInterval;
    },

    /** private: method[init]
     *  :arg target: ``Object`` The object initializing this plugin.
     */
    init: function(target) {
		gxp.plugins.Synchronizer.superclass.init.apply(this, arguments);
		var interval = this.timeInterval;
		this.target.on(
			'portalready',
			function(){
				var refresh = function(){
					var timeManagers = target.mapPanel.map.getControlsByClass('OpenLayers.Control.TimeManager');
					if (timeManagers.length <= 0){
						console.error('Cannot create Synchronizer: no TimeManager found');
						return;
					}

					var timeManager = timeManagers[0];
					var layers = timeManager.layers;					
					
					for (var i=0; i<layers.length; i++){
						var layer = layers[i];
						if (layer.getVisibility()){
							// layer.redraw(true);
							layer.mergeNewParams({fake_time: (new Date()).toISOString()});
						}
						
					}
				}
				setInterval(refresh, interval);
			
		}, this);
	
		
		
	}


});

Ext.preg(gxp.plugins.Synchronizer.prototype.ptype, gxp.plugins.Synchronizer);